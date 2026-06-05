import homeHorse from '../assets/home-horse.jpg';
import EnterDetails from '../assets/enter-details.png';
import Money from '../assets/money.jpg';
import QrCode from '../assets/qr-code.png';
import ScanCode from '../assets/scan-code.png';
import '../css/reset.css'


function Home() {



    return (
        <main>
            <div className="home-page">
                <img src={homeHorse} alt="" />
                <div className="centered-button">
                    <a href='/' className="buttonPurple buttonMain">Sign up now!</a>
                </div>
            </div>

            <div className="page-container">
                <div className="section-container purple-section-container">
                    <h1 className="textbig">How it works.</h1>
                    <div className="info-bar">
                        <div className="info-bar-fixed"><img src={EnterDetails} alt="" /></div>

                        <div className="info-bar-column">
                            <h2 className="textmedium">Upload your details</h2>
                            <p className="text-normal">Fill in the information about your horse. Choose what you wish to show and what to keep hidden in your account area.</p>
                        </div>
                    </div>

                    <div className="info-bar">
                        <div className="info-bar-fixed"><img src={QrCode} alt="" /></div>
                        <div className="info-bar-column">
                            <h2 className="textmedium">Get your QR code</h2>
                            <p className="text-normal">Either purchase a waterproof plastic tag for your stable. Or simple print it out and stick it on your stable.</p>
                        </div>
                    </div>

                    <div className="info-bar">
                        <div className="info-bar-fixed"><img src={ScanCode} alt="" /></div>
                        <div className="info-bar-column">
                            <h2 className="textmedium">Access vital info instantly</h2>
                            <p className="text-normal">Emergency contacts, medical details, and stable information are instantly accessible for both rider and horse.</p>
                        </div>
                    </div>
                </div>

                <div className="section-container white-section-container">
                    <h2 className="textbig">How much does it cost.</h2>
                    <img className='marginbsixteen' src={Money} alt='' />
                    <p className='marginbeight'>Opening an account and adding details is free. You can store all the information you need for your horse and we wont need a penny.</p>
                    <p className='marginbeight'>If you wish to share your horse details via the QR code. We charge a bi-monthly fee of £1. Yes thats 50p a month. See, not all horse related things are expensive.</p>
                    <p className='marginbeight'>You can cancel your QR code view anytime, and we will retain your horse information for you.</p>
                    <p className='marginbeight'>Whats not to like?</p>
                </div>

                <div className="section-container purple-section-container">
                    <h1 className="textbig">Your calender.</h1>

                    <div className="info-bar">
                        <div className="info-bar-fixed"><img src={EnterDetails} alt="" /></div>
                        <div className="info-bar-column">
                            <h2 className="textmedium">EquiLog Calendar</h2>
                            <p className="text-normal">When you sign up for our paid service, you can add your schedule to your EquiLog calendar. Clinics on Thursday, farrier next week, dentist in 4 weeks. Whatever you have, you can add it to our EquiLog calendar.</p>
                            <p className="text-normal">Get a message reminder a few days before so you dont forget those important dates.</p>
                            <a href='/' className="buttonWhite buttonMain">Sign up now!</a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Home