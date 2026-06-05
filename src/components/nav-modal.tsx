import { Link } from "react-router-dom";
import Modal from "react-modal";

type MyModalProps = {
    modalOpen: boolean;
    closeModal: () => void;
};

const NavModel = ({ modalOpen, closeModal }: MyModalProps) => {
    return (
        <Modal
            isOpen={modalOpen}
            onRequestClose={closeModal}
            contentLabel="Example Modal"
            className="modal"
            portalClassName="portal"
            overlayClassName="overlay"
            ariaHideApp={false}
        >
            <button className="close-button" onClick={closeModal}>Close <span className="close-x">X</span></button>

            <div className="section-container white-section-container">
                <h2 className="textbig text-purple">Menu</h2>
                <p className="marginbsixteen">
                    <Link to="/user-details?uuid=51f3040f-a3a6-4571-8854-a2f7dce8d9c6" onClick={closeModal}>
                        Your account
                    </Link>
                </p>
                <p className="marginbsixteen">
                    <Link to="/calendar?uuid=51f3040f-a3a6-4571-8854-a2f7dce8d9c6" onClick={closeModal}>
                        EquiLog calendar
                    </Link>
                </p>

                <p className="marginbsixteen">
                    <Link to="/add-details?uuid=51f3040f-a3a6-4571-8854-a2f7dce8d9c6" onClick={closeModal}>
                        Add new horse details
                    </Link>
                </p>
                <hr />

                <p className="marginbsixteen">
                    <Link to="/update-details-full?uuid=51f3040f-a3a6-4571-8854-a2f7dce8d9c6" onClick={closeModal}>
                        Update details and what to show
                    </Link>
                </p>
            </div>
        </Modal>
    );
};
export default NavModel;
