import { useState } from 'react';
import Storage from '/imports/ui/services/storage/session';

export function useSessionState(localItem) {
  const [sess, setState] = useState(Storage.getItem(localItem));
  function setSess(newItem) {
    Storage.setItem(localItem, newItem);
    setState(newItem);
  }
  return [sess, setSess];
}
