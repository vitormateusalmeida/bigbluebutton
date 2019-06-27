import { useState, createContext } from 'react';
import Storage from '../../../services/storage/session';

export const WebcamDraggableContext = createContext();

function useSessionState(sessItem) {
  const [sess, setState] = useState(Storage.getItem(localItem));
  function setSess(newItem) {
    Storage.setItem(sessItem, newItem);
    setState(newItem);
  }
  return [sess, setSess];
}

const WebcamDraggableContainer = () => {
  const [sess, setSess] = useSessionState('teste');
  return (
    <WebcamDraggableContext.Provider value={[sess, setSess]}>
      <WebcamDraggable />
    </WebcamDraggableContext.Provider>
  );
};

export default WebcamDraggableContainer;
