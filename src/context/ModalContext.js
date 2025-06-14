import React, { createContext, useState, useContext } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isDialogOpen: false,
    fromFeatureModal: false,
    selectedEvent: null,
  });

  const openModal = (selectedEvent, fromFeatureModal = false) => {
    setModalState({
      isDialogOpen: true,
      fromFeatureModal,
      selectedEvent,
    });
  };

  const closeModal = () => {
    setModalState(prev => ({
      ...prev,
      isDialogOpen: false,
      // Preserve fromFeatureModal and selectedEvent
    }));
  };

  const clearModalState = () => {
    setModalState({
      isDialogOpen: false,
      fromFeatureModal: false,
      selectedEvent: null,
    });
  };

  return (
    <ModalContext.Provider value={{ modalState, openModal, closeModal, clearModalState }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);