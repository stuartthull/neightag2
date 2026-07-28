import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
    buildChangedHorsePayload,
    hasAppointmentFieldChanged,
    shouldSyncAppointment,
} from '../utils/horse-profile';
import '../css/edit-horse.css';

const INITIAL_FORM_DATA = {
    horse_name: '',
    horse_dob: '',
    horse_weight_kg: '',
    horse_vet_name: '',
    horse_vet_practice: '',
    horse_vet_phone_one: '',
    horse_last_weighed: '',
    horse_passport_number: '',
    horse_medication: '',
    horse_allergies: '',
    farrier_name: '',
    farrier_phone_one: '',
    farrier_email: '',
    farrier_next_visit: '', // 🗓️ Populated via equi_calendar
    farrier_notes: '',
    horse_breed: '',
    horse_colour: '',
    horse_height: '',
    dentist_name: '',
    dentist_phone_one: '',
    dentist_email: '',
    dentist_next_visit: '', // 🗓️ Populated via equi_calendar
    dentist_notes: '',
    // 🪱 NEW WORMING STATE DATA KEY SIGNATURES
    worming_date: '', // 🗓️ Populated via equi_calendar
    worming_notes: '',
    emergency_name_one: '',
    emergency_phone_one: '',
    emergency_name_two: '',
    emergency_phone_two: '',
    emergency_name_three: '',
    emergency_phone_three: '',
    feed_instructions: '',
    horse_behaviours: '',
    saddle_fitter_name: '',
    saddle_fitter_phone: '',
    saddle_fitter_next_visit: '', // 🗓️ Populated via equi_calendar
    saddle_fitter_notes: '',
    physio_name: '',
    physio_phone: '',
    physio_next_visit: '', // 🗓️ Populated via equi_calendar
    physio_notes: '',
    horse_image_url: '',
    insurance_provider: '',
    insurance_policy_number: '',
    insurance_date: '',
    insurance_phone: '',
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_ORIGINAL_IMAGE_SIZE_BYTES = 15 * 1024 * 1024;
const MAX_UPLOAD_IMAGE_SIZE_BYTES = 3 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1200;
const IMAGE_COMPRESSION_QUALITY = 0.82;
const UPLOAD_IMAGE_TYPE = 'image/jpeg';
const UPLOAD_IMAGE_EXTENSION = 'jpg';

const CALENDAR_FIELDS = [
    'farrier_next_visit',
    'dentist_next_visit',
    'saddle_fitter_next_visit',
    'physio_next_visit',
    'worming_date',
];

type OptimisedImage = {
    blob: Blob;
    contentType: string;
    extension: string;
};

const formatFileSize = (bytes: number): string => {
    const megabytes = bytes / (1024 * 1024);
    return `${megabytes.toFixed(megabytes >= 10 ? 0 : 1)}MB`;
};

const loadImageFromObjectUrl = (objectUrl: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('The selected image could not be loaded.'));
        image.src = objectUrl;
    });

const canvasToBlob = (
    canvas: HTMLCanvasElement,
    type: string,
    quality: number
): Promise<Blob | null> =>
    new Promise((resolve) => {
        canvas.toBlob(resolve, type, quality);
    });

const resizeImageForUpload = async (file: File): Promise<OptimisedImage> => {
    const objectUrl = URL.createObjectURL(file);

    try {
        const image = await loadImageFromObjectUrl(objectUrl);
        const scale = Math.min(
            1,
            MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight)
        );
        const width = Math.max(1, Math.round(image.naturalWidth * scale));
        const height = Math.max(1, Math.round(image.naturalHeight * scale));
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
            throw new Error('Your browser could not prepare this image for upload.');
        }

        canvas.width = width;
        canvas.height = height;
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);

        const jpegBlob = await canvasToBlob(canvas, UPLOAD_IMAGE_TYPE, IMAGE_COMPRESSION_QUALITY);
        if (jpegBlob && jpegBlob.size <= MAX_UPLOAD_IMAGE_SIZE_BYTES) {
            return {
                blob: jpegBlob,
                contentType: UPLOAD_IMAGE_TYPE,
                extension: UPLOAD_IMAGE_EXTENSION,
            };
        }

        throw new Error(
            `This image is still ${formatFileSize(
                jpegBlob?.size || file.size
            )} after optimisation. Please choose a smaller image.`
        );
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
};

export default function EditItem(): React.JSX.Element {
    const { horse_uuid } = useParams<{ horse_uuid: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<any>(INITIAL_FORM_DATA);
    const [originalData, setOriginalData] = useState<any>(INITIAL_FORM_DATA);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [imageUploadStatus, setImageUploadStatus] = useState('');
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [saveConfirmationId, setSaveConfirmationId] = useState<number | null>(null);
    const [dirtyFields, setDirtyFields] = useState<Set<string>>(() => new Set());

    const normalizeDate = (dateVal: unknown): string => {
        if (!dateVal) return '';
        const dateStr = String(dateVal).trim();
        return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.substring(0, 10);
    };

    const getOwnerId = (): string => {
        return formData.user_uuid || originalData.user_uuid || currentUserId;
    };

    useEffect(() => {
        const fetchCoreVitals = async () => {
            if (!horse_uuid) {
                console.error('No horse_uuid parameter identified in the current layout context.');
                navigate('/dashboard');
                return;
            }

            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            setCurrentUserId(user.id);

            // 1. Fetch main profile data
            const { data: horseData, error: horseError } = await supabase
                .from('equi_log_main')
                .select('*')
                .eq('horse_uuid', horse_uuid)
                .eq('user_uuid', user.id)
                .single();

            if (horseError) {
                console.error('Error fetching core log payload:', horseError);
                navigate('/dashboard');
                return;
            }

            // 2. 🗓️ Fetch calendar schedules matching this exact horse
            const { data: calData, error: calError } = await supabase
                .from('equi_calendar')
                .select('calendar_title, calendar_date')
                .eq('horse_uuid', horse_uuid)
                .eq('user_uuid', user.id);

            if (calError) {
                console.error('Error fetching calendar dates:', calError.message);
                alert('Appointment dates could not be loaded. Please refresh before saving.');
                setLoading(false);
                return;
            }

            const calendarMap: any = {};
            if (calData) {
                calData.forEach((event: any) => {
                    calendarMap[event.calendar_title] = normalizeDate(event.calendar_date);
                });
            }

            const safePayload: any = {};
            Object.keys(horseData || {}).forEach((key) => {
                if (key in INITIAL_FORM_DATA || key === 'user_uuid' || key === 'horse_uuid') {
                    if (
                        key === 'horse_dob' ||
                        key === 'horse_last_weighed' ||
                        key === 'insurance_date'
                    ) {
                        safePayload[key] = horseData[key] ? normalizeDate(horseData[key]) : '';
                    } else {
                        safePayload[key] = horseData[key] === null ? '' : horseData[key];
                    }
                }
            });

            // Map database calendar dates explicitly back into local state signatures
            safePayload['farrier_next_visit'] = calendarMap['Farrier Visit'] || '';
            safePayload['dentist_next_visit'] = calendarMap['Dentist Visit'] || '';
            safePayload['saddle_fitter_next_visit'] = calendarMap['Saddle Fitter Visit'] || '';
            safePayload['physio_next_visit'] = calendarMap['Physio Visit'] || '';
            safePayload['worming_date'] =
                calendarMap['Worming Due'] || normalizeDate(horseData.worming_date);

            const loadedData = { ...INITIAL_FORM_DATA, ...safePayload };
            setFormData(loadedData);
            setOriginalData(loadedData);
            setLoading(false);
        };

        fetchCoreVitals();
    }, [horse_uuid, navigate]);

    useEffect(() => {
        if (saveConfirmationId === null) return;

        const timeoutId = window.setTimeout(() => {
            setSaveConfirmationId(null);
        }, 5000);

        return () => window.clearTimeout(timeoutId);
    }, [saveConfirmationId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setDirtyFields((fields) => new Set(fields).add(name));
    };

    const syncAppointmentsToCalendar = async (
        current: any,
        original: any,
        changedFields: Set<string>,
        ownerUuid: string
    ) => {
        if (!ownerUuid || !horse_uuid) {
            throw new Error('Could not verify the owner of this horse record.');
        }

        const appointmentTypes = [
            {
                key: 'farrier_next_visit',
                notesKey: 'farrier_notes',
                title: 'Farrier Visit',
            },
            {
                key: 'dentist_next_visit',
                notesKey: 'dentist_notes',
                title: 'Dentist Visit',
            },
            {
                key: 'saddle_fitter_next_visit',
                notesKey: 'saddle_fitter_notes',
                title: 'Saddle Fitter Visit',
            },
            {
                key: 'physio_next_visit',
                notesKey: 'physio_notes',
                title: 'Physio Visit',
            },
            { key: 'worming_date', notesKey: 'worming_notes', title: 'Worming Due' },
        ];

        for (const appt of appointmentTypes) {
            if (!hasAppointmentFieldChanged(changedFields, appt.key, appt.notesKey)) {
                continue;
            }

            const newDate = normalizeDate(current[appt.key]);
            const oldDate = normalizeDate(original[appt.key]);
            const newNotes = current[appt.notesKey] || '';
            const oldNotes = original[appt.notesKey] || '';

            if (shouldSyncAppointment(newDate, oldDate, newNotes, oldNotes)) {
                if (newDate) {
                    const { data: existingAppointment, error: lookupError } = await supabase
                        .from('equi_calendar')
                        .select('id')
                        .eq('horse_uuid', horse_uuid)
                        .eq('user_uuid', ownerUuid)
                        .eq('calendar_title', appt.title)
                        .maybeSingle();

                    if (lookupError) {
                        throw new Error(`Could not check ${appt.title}: ${lookupError.message}`);
                    }

                    const appointmentPayload = {
                        user_uuid: ownerUuid,
                        horse_uuid: horse_uuid,
                        calendar_date: newDate,
                        calendar_title: appt.title,
                        calendar_notes: newNotes,
                    };

                    const { error } = existingAppointment
                        ? await supabase
                              .from('equi_calendar')
                              .update(appointmentPayload)
                              .eq('id', existingAppointment.id)
                              .eq('user_uuid', ownerUuid)
                        : await supabase.from('equi_calendar').insert([appointmentPayload]);

                    if (error) {
                        throw new Error(`Could not save ${appt.title}: ${error.message}`);
                    }
                } else if (oldDate) {
                    const { error } = await supabase
                        .from('equi_calendar')
                        .delete()
                        .eq('horse_uuid', horse_uuid)
                        .eq('user_uuid', ownerUuid)
                        .eq('calendar_title', appt.title);

                    if (error) {
                        throw new Error(`Could not clear ${appt.title}: ${error.message}`);
                    }
                }
            }
        }
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const excludedFields = new Set([...CALENDAR_FIELDS, 'user_uuid', 'horse_uuid', 'id']);
        const vitalsPayload = buildChangedHorsePayload(formData, originalData, excludedFields);

        try {
            if (Object.keys(vitalsPayload).length > 0) {
                const { error } = await supabase
                    .from('equi_log_main')
                    .update(vitalsPayload)
                    .eq('horse_uuid', horse_uuid)
                    .eq('user_uuid', currentUserId);

                if (error) {
                    throw new Error(`Could not save horse details: ${error.message}`);
                }
            }

            await syncAppointmentsToCalendar(formData, originalData, dirtyFields, currentUserId);
            setOriginalData({ ...formData });
            setDirtyFields(new Set());
            setSaveConfirmationId(Date.now());
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown database error';
            console.error('Error saving horse details:', error);
            alert(`Database Error: ${message}`);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            alert('Please upload a valid image file (.jpg, .png, or .webp)');
            event.target.value = '';
            return;
        }

        if (file.size > MAX_ORIGINAL_IMAGE_SIZE_BYTES) {
            alert(
                `That photo is ${formatFileSize(file.size)}. Please choose an image smaller than ${formatFileSize(
                    MAX_ORIGINAL_IMAGE_SIZE_BYTES
                )}.`
            );
            event.target.value = '';
            return;
        }

        const ownerId = getOwnerId();

        if (!ownerId || !horse_uuid) {
            alert('Error: Could not verify this horse record. Please refresh and try again.');
            event.target.value = '';
            return;
        }

        setIsUploadingImage(true);
        setImageUploadStatus('Optimising photo...');

        let optimisedImage: OptimisedImage;

        try {
            optimisedImage = await resizeImageForUpload(file);
        } catch (error) {
            console.error('Image optimisation error:', error);
            alert(
                error instanceof Error
                    ? error.message
                    : 'Failed to optimise this photo. Please try another image.'
            );
            setIsUploadingImage(false);
            setImageUploadStatus('');
            event.target.value = '';
            return;
        }

        const filePath = `${ownerId}/${horse_uuid}-${Date.now()}.${optimisedImage.extension}`;
        setImageUploadStatus('Uploading photo...');

        const { error: uploadError } = await supabase.storage
            .from('horse-photos')
            .upload(filePath, optimisedImage.blob, {
                contentType: optimisedImage.contentType,
                upsert: true,
            });

        if (uploadError) {
            console.error('Upload error:', uploadError.message);
            alert(`Failed to upload image to server storage: ${uploadError.message}`);
            setIsUploadingImage(false);
            setImageUploadStatus('');
            event.target.value = '';
            return;
        }

        const {
            data: { publicUrl },
        } = supabase.storage.from('horse-photos').getPublicUrl(filePath);

        const { data: updatedHorse, error: dbError } = await supabase
            .from('equi_log_main')
            .update({ horse_image_url: publicUrl })
            .eq('horse_uuid', horse_uuid)
            .eq('user_uuid', ownerId)
            .select('horse_image_url')
            .single();

        setIsUploadingImage(false);
        setImageUploadStatus('');
        event.target.value = '';

        if (!dbError && updatedHorse) {
            setFormData((prev: any) => ({
                ...prev,
                horse_image_url: updatedHorse.horse_image_url,
            }));
            setOriginalData((prev: any) => ({
                ...prev,
                horse_image_url: updatedHorse.horse_image_url,
            }));
            alert('Profile photo updated successfully!');
        } else {
            await supabase.storage.from('horse-photos').remove([filePath]);
            console.error('Database link error:', dbError?.message);
            alert(
                `Failed to link uploaded image to this horse record: ${dbError?.message || 'No matching record found'}`
            );
        }
    };

    const handleRemoveImage = async () => {
        if (!window.confirm('Are you sure you want to remove this profile photo?')) return;

        const currentImageUrl = formData.horse_image_url;

        if (currentImageUrl) {
            try {
                const urlParts = currentImageUrl.split('/horse-photos/');
                if (urlParts.length === 2) {
                    const storagePath = urlParts[1];

                    const { error: storageError } = await supabase.storage
                        .from('horse-photos')
                        .remove([storagePath]);

                    if (storageError) {
                        console.error('Storage cleanup warning:', storageError.message);
                    }
                }
            } catch (err) {
                console.error('Failed parsing storage key path context:', err);
            }
        }

        const ownerId = getOwnerId();

        if (!ownerId || !horse_uuid) {
            alert('Error: Could not verify this horse record. Please refresh and try again.');
            return;
        }

        const { data: updatedHorse, error: dbError } = await supabase
            .from('equi_log_main')
            .update({ horse_image_url: null })
            .eq('horse_uuid', horse_uuid)
            .eq('user_uuid', ownerId)
            .select('horse_image_url')
            .single();

        if (!dbError && updatedHorse) {
            setFormData((prev: any) => ({ ...prev, horse_image_url: '' }));
            setOriginalData((prev: any) => ({ ...prev, horse_image_url: '' }));
            alert('Profile photo removed cleanly!');
        } else {
            alert('Failed to update profile record: ' + dbError.message);
        }
    };

    if (loading)
        return (
            <div className="page-wrapper">
                <div className="page-container">
                    <section className="section-container purple-section-container">
                        <h1 className="textmedium">Populating comprehensive records...</h1>
                    </section>
                </div>
            </div>
        );

    return (
        <div className="page-wrapper">
            {saveConfirmationId !== null && (
                <div className="edit-horse-save-message" role="status" aria-live="polite">
                    Changes saved successfully.
                </div>
            )}
            <div className="page-container">
                <form onSubmit={handleUpdate}>
                    {/* HERO SECTION */}
                    <section className="section-container purple-section-container">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="buttonWhite buttonMain marginbsixteen"
                        >
                            ← Back to Your Stable
                        </button>
                        <div>
                            <h1 className="textbig">
                                Edit {formData.horse_name || 'Unnamed'}'s Record
                            </h1>

                            {/* PROFILE IMAGE MANAGER PANEL */}
                            <div
                                style={{
                                    marginBottom: '32px',
                                    display: 'flex',
                                    gap: '20px',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                }}
                            >
                                <div style={{ position: 'relative' }}>
                                    {formData.horse_image_url ? (
                                        <img
                                            src={formData.horse_image_url}
                                            alt="Horse preview"
                                            style={{
                                                width: '100px',
                                                height: '100px',
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                backgroundColor: 'white',
                                                width: '100px',
                                                height: '100px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '2rem',
                                            }}
                                        >
                                            🐴
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-normal">
                                        <strong>Profile Picture</strong>
                                    </p>

                                    {formData.horse_image_url ? (
                                        <div>
                                            <p className="text-normal marginbsixteen">
                                                ✓ Photo uploaded successfully
                                            </p>
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="buttonMain buttonOrange"
                                                disabled={isUploadingImage}
                                            >
                                                Remove Photo
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                                                Upload a photo of your horse (.jpg, .png, .webp).
                                                Large photos are resized before upload.
                                            </p>
                                            <label
                                                htmlFor="horse_image_input"
                                                className="buttonMain buttonOrange file-upload-button"
                                            >
                                                {imageUploadStatus || 'Choose Photo'}
                                            </label>
                                            <p className="image-upload-helper-text">
                                                Max original size:{' '}
                                                {formatFileSize(MAX_ORIGINAL_IMAGE_SIZE_BYTES)}.
                                            </p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        id="horse_image_input"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleImageUpload}
                                        className="visually-hidden-file-input"
                                        disabled={isUploadingImage}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* EMERGENCY CONTACTS */}
                    <section className="section-container purple-section-container">
                        <h2 className="textmedium marginbeight">Emergency Contacts</h2>
                        <div className="form-grid-two">
                            <div className="form-grid-card">
                                <p className="text-normal marginbeight">
                                    <strong>Primary Contact</strong>
                                </p>
                                <input
                                    className="inputText marginbeight"
                                    placeholder="Name"
                                    name="emergency_name_one"
                                    type="text"
                                    value={formData.emergency_name_one}
                                    onChange={handleChange}
                                />
                                <input
                                    className="inputText"
                                    placeholder="Phone"
                                    name="emergency_phone_one"
                                    type="text"
                                    value={formData.emergency_phone_one}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-grid-card">
                                <p className="text-normal marginbeight">
                                    <strong>Secondary Contact</strong>
                                </p>
                                <input
                                    className="inputText marginbeight"
                                    placeholder="Name"
                                    name="emergency_name_two"
                                    type="text"
                                    value={formData.emergency_name_two}
                                    onChange={handleChange}
                                />
                                <input
                                    className="inputText"
                                    placeholder="Phone"
                                    name="emergency_phone_two"
                                    type="text"
                                    value={formData.emergency_phone_two}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-grid-card">
                                <p className="text-normal marginbeight">
                                    <strong>Third Contact</strong>
                                </p>
                                <input
                                    className="inputText marginbeight"
                                    placeholder="Name"
                                    name="emergency_name_three"
                                    type="text"
                                    value={formData.emergency_name_three}
                                    onChange={handleChange}
                                />
                                <input
                                    className="inputText"
                                    placeholder="Phone"
                                    name="emergency_phone_three"
                                    type="text"
                                    value={formData.emergency_phone_three}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="section-container white-section-container">
                        <h2 className="textmedium marginbsixteen">
                            <label htmlFor="horse_behaviours">Horse Behaviours</label>
                        </h2>
                        <textarea
                            className="textarea-standalone"
                            id="horse_behaviours"
                            name="horse_behaviours"
                            value={formData.horse_behaviours}
                            onChange={handleChange}
                        />
                    </section>

                    {/* IDENTITY & PROFILE */}
                    <section className="section-container white-section-container">
                        <h2 className="textmedium marginbsixteen">Horse Identity & Profile</h2>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="horse_name">Horse Name:</label>
                            <input
                                className="inputText"
                                id="horse_name"
                                name="horse_name"
                                type="text"
                                value={formData.horse_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="horse_breed">Breed:</label>
                            <input
                                className="inputText"
                                id="horse_breed"
                                name="horse_breed"
                                type="text"
                                value={formData.horse_breed}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="horse_colour">Colour:</label>
                            <input
                                className="inputText"
                                id="horse_colour"
                                name="horse_colour"
                                type="text"
                                value={formData.horse_colour}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="horse_height">Height (hh):</label>
                            <input
                                className="inputText"
                                id="horse_height"
                                name="horse_height"
                                type="text"
                                value={formData.horse_height}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="horse_dob">Date of Birth:</label>
                            <input
                                className="inputText"
                                id="horse_dob"
                                name="horse_dob"
                                type="date"
                                value={formData.horse_dob}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="horse_passport_number">Passport Number:</label>
                            <input
                                className="inputText"
                                id="horse_passport_number"
                                name="horse_passport_number"
                                type="text"
                                value={formData.horse_passport_number}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="horse_weight_kg">Weight (kg):</label>
                            <input
                                className="inputText"
                                id="horse_weight_kg"
                                name="horse_weight_kg"
                                type="text"
                                value={formData.horse_weight_kg}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="horse_last_weighed">Last Weighed:</label>
                            <input
                                className="inputText"
                                id="horse_last_weighed"
                                name="horse_last_weighed"
                                type="date"
                                value={formData.horse_last_weighed}
                                onChange={handleChange}
                            />
                        </div>
                    </section>

                    {/* HORSE INSURANCE */}
                    <section className="section-container white-section-container">
                        <h2 className="textmedium marginbsixteen">Horse Insurance Details</h2>
                        <p>
                            (<b>NOTE:</b> This will never appear on your public view)
                        </p>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="insurance_provider">Horse Insurer:</label>
                            <input
                                className="inputText"
                                id="insurance_provider"
                                name="insurance_provider"
                                type="text"
                                value={formData.insurance_provider}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="insurance_policy_number">Policy Number:</label>
                            <input
                                className="inputText"
                                id="insurance_policy_number"
                                name="insurance_policy_number"
                                type="text"
                                value={formData.insurance_policy_number}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="insurance_date">Renewal Date:</label>
                            <input
                                className="inputText"
                                id="insurance_date"
                                name="insurance_date"
                                type="date"
                                value={formData.insurance_date}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="insurance_phone">Claims Phone:</label>
                            <input
                                className="inputText"
                                id="insurance_phone"
                                name="insurance_phone"
                                type="text"
                                value={formData.insurance_phone}
                                onChange={handleChange}
                            />
                        </div>
                    </section>

                    {/* 💡 NEW: WORMING SCHEDULE & HISTORY ENTRY CONTAINER CARD */}
                    <section className="section-container white-section-container">
                        <h2 className="textmedium marginbsixteen">Worming Schedule</h2>
                        <p>
                            (<b>NOTE:</b> This will never appear on your public view)
                        </p>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="worming_date">Next Treatment Due:</label>
                            <input
                                className="inputText"
                                id="worming_date"
                                name="worming_date"
                                type="date"
                                value={formData.worming_date}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-field-row-mixed">
                            <label className="text-normal" htmlFor="worming_notes">
                                Treatment Notes & Products Used
                            </label>
                            <textarea
                                className="inputText"
                                id="worming_notes"
                                name="worming_notes"
                                value={formData.worming_notes}
                                onChange={handleChange}
                            />
                        </div>
                    </section>

                    {/* VETERINARY */}
                    <section className="section-container white-section-container">
                        <h2 className="textmedium marginbsixteen">Veterinary Details</h2>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="horse_vet_name">Vet Name:</label>
                            <input
                                className="inputText"
                                id="horse_vet_name"
                                name="horse_vet_name"
                                type="text"
                                value={formData.horse_vet_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="horse_vet_practice">Vet Practice:</label>
                            <input
                                className="inputText"
                                id="horse_vet_practice"
                                name="horse_vet_practice"
                                type="text"
                                value={formData.horse_vet_practice}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="horse_vet_phone_one">Vet Phone:</label>
                            <input
                                className="inputText"
                                id="horse_vet_phone_one"
                                name="horse_vet_phone_one"
                                type="text"
                                value={formData.horse_vet_phone_one}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="textarea-block-group form-field-row-mixed">
                            <label className="text-normal" htmlFor="horse_medication">
                                Current Medication
                            </label>
                            <textarea
                                className="inputText"
                                id="horse_medication"
                                name="horse_medication"
                                value={formData.horse_medication}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="textarea-block-group form-field-row-mixed">
                            <label className="text-normal" htmlFor="horse_allergies">
                                Allergies
                            </label>
                            <textarea
                                className="inputText"
                                id="horse_allergies"
                                name="horse_allergies"
                                value={formData.horse_allergies}
                                onChange={handleChange}
                            />
                        </div>
                    </section>

                    {/* SADDLE FITTER */}
                    <section className="section-container white-section-container">
                        <h2 className="textmedium marginbsixteen">Saddle Fitter Details</h2>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="saddle_fitter_name">Fitter Name:</label>
                            <input
                                className="inputText"
                                id="saddle_fitter_name"
                                name="saddle_fitter_name"
                                type="text"
                                value={formData.saddle_fitter_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="saddle_fitter_phone">Phone:</label>
                            <input
                                className="inputText"
                                id="saddle_fitter_phone"
                                name="saddle_fitter_phone"
                                type="text"
                                value={formData.saddle_fitter_phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="saddle_fitter_next_visit">Next Visit:</label>
                            <input
                                className="inputText"
                                id="saddle_fitter_next_visit"
                                name="saddle_fitter_next_visit"
                                type="date"
                                value={formData.saddle_fitter_next_visit}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="textarea-block-group form-field-row-mixed">
                            <label className="text-normal" htmlFor="saddle_fitter_notes">
                                Saddle Notes
                            </label>
                            <textarea
                                className="inputText"
                                id="saddle_fitter_notes"
                                name="saddle_fitter_notes"
                                value={formData.saddle_fitter_notes}
                                onChange={handleChange}
                            />
                        </div>
                    </section>

                    {/* PHYSIOTHERAPIST */}
                    <section className="section-container white-section-container">
                        <h2 className="textmedium marginbsixteen">Physiotherapist Details</h2>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="physio_name">Physio Name:</label>
                            <input
                                className="inputText"
                                id="physio_name"
                                name="physio_name"
                                type="text"
                                value={formData.physio_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="physio_phone">Phone:</label>
                            <input
                                className="inputText"
                                id="physio_phone"
                                name="physio_phone"
                                type="text"
                                value={formData.physio_phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="physio_next_visit">Next Visit:</label>
                            <input
                                className="inputText"
                                id="physio_next_visit"
                                name="physio_next_visit"
                                type="date"
                                value={formData.physio_next_visit}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="textarea-block-group form-field-row-mixed">
                            <label className="text-normal" htmlFor="physio_notes">
                                Physio Notes
                            </label>
                            <textarea
                                className="inputText"
                                id="physio_notes"
                                name="physio_notes"
                                value={formData.physio_notes}
                                onChange={handleChange}
                            />
                        </div>
                    </section>

                    {/* FARRIER */}
                    <section className="section-container white-section-container">
                        <h2 className="textmedium marginbsixteen">Farrier Log</h2>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="farrier_name">Farrier Name:</label>
                            <input
                                className="inputText"
                                id="farrier_name"
                                name="farrier_name"
                                type="text"
                                value={formData.farrier_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="farrier_phone_one">Phone:</label>
                            <input
                                className="inputText"
                                id="farrier_phone_one"
                                name="farrier_phone_one"
                                type="text"
                                value={formData.farrier_phone_one}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="farrier_next_visit">Next Visit:</label>
                            <input
                                className="inputText"
                                id="farrier_next_visit"
                                name="farrier_next_visit"
                                type="date"
                                value={formData.farrier_next_visit}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="textarea-block-group form-field-row-mixed">
                            <label className="text-normal" htmlFor="farrier_notes">
                                Structural Notes
                            </label>
                            <textarea
                                className="inputText"
                                id="farrier_notes"
                                name="farrier_notes"
                                value={formData.farrier_notes}
                                onChange={handleChange}
                            />
                        </div>
                    </section>

                    {/* DENTIST */}
                    <section className="section-container white-section-container">
                        <h2 className="textmedium marginbsixteen">Equine Dentist Log</h2>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="dentist_name">Dentist Name:</label>
                            <input
                                className="inputText"
                                id="dentist_name"
                                name="dentist_name"
                                type="text"
                                value={formData.dentist_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="dentist_phone_one">Phone:</label>
                            <input
                                className="inputText"
                                id="dentist_phone_one"
                                name="dentist_phone_one"
                                type="text"
                                value={formData.dentist_phone_one}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="dentist_next_visit">Next Appt:</label>
                            <input
                                className="inputText"
                                id="dentist_next_visit"
                                name="dentist_next_visit"
                                type="date"
                                value={formData.dentist_next_visit}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-field-row-mixed marginbsixteen">
                            <label className="text-normal" htmlFor="dentist_notes">
                                Treatment Notes
                            </label>
                            <textarea
                                className="inputText"
                                id="dentist_notes"
                                name="dentist_notes"
                                value={formData.dentist_notes}
                                onChange={handleChange}
                            />
                        </div>
                    </section>

                    {/* FEED & INSTRUCTIONS */}
                    <section className="section-container white-section-container">
                        <h2 className="textmedium marginbsixteen">
                            <label htmlFor="feed_instructions">
                                Feeding & Turnout Instructions
                            </label>
                        </h2>
                        <textarea
                            className="textarea-standalone"
                            id="feed_instructions"
                            name="feed_instructions"
                            value={formData.feed_instructions}
                            onChange={handleChange}
                        />
                    </section>

                    <div className="form-content-spacer"></div>
                    <div className="sticky-actions-bar">
                        <button type="submit" className="buttonMain buttonOrange">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
