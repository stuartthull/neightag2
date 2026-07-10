import React, { useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';

type BookmarkTab = 'iphone' | 'android';

export default function AddBookmark(): React.JSX.Element {
    const [activeTab, setActiveTab] = useState<BookmarkTab>('iphone');
    const tabRefs = {
        iphone: useRef<HTMLButtonElement>(null),
        android: useRef<HTMLButtonElement>(null),
    };

    const handleKeyDown = (e: React.KeyboardEvent, currentTab: BookmarkTab) => {
        const tabs: BookmarkTab[] = ['iphone', 'android'];
        const currentIndex = tabs.indexOf(currentTab);
        let nextIndex;

        if (e.key === 'ArrowRight') {
            nextIndex = (currentIndex + 1) % tabs.length;
            setActiveTab(tabs[nextIndex]);
            tabRefs[tabs[nextIndex]].current?.focus();
        } else if (e.key === 'ArrowLeft') {
            nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            setActiveTab(tabs[nextIndex]);
            tabRefs[tabs[nextIndex]].current?.focus();
        }
    };

    return (
        <main className="page-wrapper">
            <Helmet>
                <title>Add a Bookmark | Contact NeighTag</title>
                <meta
                    name="description"
                    content="Add a Bookmark for NeighTag to your home screen to access the NeighTag app and manage your stable."
                />
                <meta property="og:title" content="Add a Bookmark | Contact NeighTag" />
            </Helmet>
            <div className="page-container">
                <section className="section-container purple-section-container">
                    <h1 className="textbig marginbsixteen">
                        Add a website icon to your Home Screen
                    </h1>
                    <p className="text-medium marginbsixteen">
                        Easily access NeighTag from your home screen by adding a bookmark. This
                        allows you to quickly manage your stable and stay connected with your
                        horse's safety features.
                    </p>
                </section>

                <section className="tab-container-bookmark section-container white-section-container">
                    <div
                        className="tabs-navigation"
                        role="tablist"
                        aria-label="Bookmark instructions by device"
                    >
                        <button
                            ref={tabRefs.iphone}
                            id="tab-iphone"
                            role="tab"
                            aria-selected={activeTab === 'iphone'}
                            aria-controls="panel-iphone"
                            tabIndex={activeTab === 'iphone' ? 0 : -1}
                            onClick={() => setActiveTab('iphone')}
                            onKeyDown={(e) => handleKeyDown(e, 'iphone')}
                            className="tab-trigger"
                        >
                            iPhone Bookmark
                        </button>
                        <button
                            ref={tabRefs.android}
                            id="tab-android"
                            role="tab"
                            aria-selected={activeTab === 'android'}
                            aria-controls="panel-android"
                            tabIndex={activeTab === 'android' ? 0 : -1}
                            onClick={() => setActiveTab('android')}
                            onKeyDown={(e) => handleKeyDown(e, 'android')}
                            className="tab-trigger"
                        >
                            Android Bookmark
                        </button>
                    </div>

                    <div
                        id="panel-iphone"
                        role="tabpanel"
                        aria-labelledby="tab-iphone"
                        className="tab-panel"
                        hidden={activeTab !== 'iphone'}
                    >
                        <h2 className="textbig marginbsixteen">iPhone Home Screen</h2>
                        <p className="text-medium marginbsixteen">
                            You can add a website icon to your iPhone Home Screen for quick access.
                        </p>
                        <ol>
                            <li className="bookmark-list">
                                <p className="text-medium marginbsixteen">
                                    Go to the Safari app{' '}
                                    <img
                                        src="/images/safari.png"
                                        alt=""
                                        height="30"
                                        width="30"
                                        className="bookmark-icon"
                                    />{' '}
                                    on your iPhone.
                                </p>
                            </li>
                            <li className="bookmark-list">
                                <p className="text-medium marginbsixteen">
                                    Go to the homepage of Neightag to add to your Home Screen.
                                </p>
                            </li>
                            <li className="bookmark-list">
                                <p className="text-medium marginbsixteen">
                                    Tap{' '}
                                    <span className="NoBreak">
                                        <img
                                            src="/images/threedots.png"
                                            alt="the More button"
                                            height="30"
                                            width="30"
                                            className="bookmark-icon"
                                        />
                                        ,{' '}
                                    </span>
                                    then tap Share.
                                </p>
                                <p className="text-medium marginbsixteen">
                                    If your Tabs layout is Bottom or Top, tap{' '}
                                    <span className="NoBreak">
                                        <img
                                            src="/images/share.png"
                                            alt="the Share button"
                                            height="30"
                                            width="25"
                                            className="bookmark-icon"
                                        />
                                        .
                                    </span>
                                </p>
                            </li>
                            <li className="bookmark-list">
                                <p className="text-medium marginbsixteen">
                                    Scroll down the list of options, then tap Add to Home Screen.
                                </p>
                                <p className="text-medium marginbsixteen">
                                    If you don’t see Add to Home Screen, you can add it. Scroll down
                                    to the bottom of the list, tap Edit&nbsp;Actions, then tap{' '}
                                    <img
                                        src="/images/plus.png"
                                        alt=""
                                        height="30"
                                        width="30"
                                        className="bookmark-icon"
                                    />{' '}
                                    Add to Home Screen.
                                </p>
                                <p className="text-medium marginbsixteen">
                                    You can choose Open as Web App to use the website as if it’s an
                                    app. See{' '}
                                    <a
                                        href="https://support.apple.com/en-gb/guide/iphone/open-as-web-app-iphea86e5236/26/ios/26"
                                        className="xRef AppleTopic"
                                    >
                                        Turn a website into an app
                                    </a>
                                    .
                                </p>
                            </li>
                            <li className="bookmark-list">
                                <p>Tap Add.</p>
                            </li>
                        </ol>
                        <p className="text-medium marginbsixteen">
                            The icon appears only on the device where you add it.
                        </p>
                        <figure className="marginbsixteen">
                            <img
                                src="/images/iphone.png"
                                alt="In Safari, the Share button on a website has been tapped, displaying a list of options, including Add to Home Screen."
                                height="504"
                                width="281"
                            />
                        </figure>
                        <div className="Alert">
                            <p className="Note">
                                <em>Note: </em>Some websites may ask for permission to send you
                                notifications. You can change your notification settings at any
                                time. See{' '}
                                <a
                                    href="https://support.apple.com/en-gb/guide/iphone/change-notification-settings-iph7c3d96bab/26/ios/26"
                                    className="xRef AppleTopic"
                                >
                                    Change notification settings
                                </a>
                                .
                            </p>
                        </div>
                    </div>

                    <div
                        id="panel-android"
                        role="tabpanel"
                        aria-labelledby="tab-android"
                        className="tab-panel"
                        hidden={activeTab !== 'android'}
                    >
                        <h2 className="textbig marginbsixteen">Android Home Screen</h2>
                        <p className="text-medium marginbsixteen">
                            You can create shortcuts to websites on your device’s homepage.
                        </p>
                        <p className="text-medium marginbsixteen">
                            On your Android device, open Chrome Chrome.
                            <img
                                src="/images/chrome.png"
                                alt="the More button"
                                height="30"
                                width="30"
                                className="bookmark-icon"
                            />
                        </p>
                        <ol>
                            <li className="bookmark-list">
                                <p className="text-medium marginbsixteen">
                                    Go to the homepage of Neightag to create a shortcut.
                                </p>
                            </li>

                            <li className="bookmark-list">
                                <p className="text-medium marginbsixteen">
                                    To the right of the address bar, tap More{' '}
                                    <img
                                        src="/images/threedots2.png"
                                        alt="the More button"
                                        height="30"
                                        width="30"
                                        className="bookmark-icon"
                                    />{' '}
                                    <b>Add to home screen</b> then <b>Create shortcut</b>.
                                </p>
                            </li>
                            <li className="bookmark-list">
                                <p className="text-medium marginbsixteen">
                                    From the dialog that appears:
                                    <br />
                                    <b>Rename</b>: Select the default name for the shortcut or
                                    rename the shortcut.
                                </p>
                            </li>
                            <li className="bookmark-list">
                                <p className="text-medium marginbsixteen">Tap Add.</p>
                            </li>
                        </ol>
                        <p className="text-medium marginbsixteen">
                            Tip: Shortcuts with Chrome logo will open in Chrome.
                        </p>

                        <figure className="marginbsixteen">
                            <img
                                src="/images/android.jpg"
                                alt="Android screen"
                                height="504"
                                width="281"
                            />
                        </figure>
                    </div>
                </section>
            </div>
        </main>
    );
}
