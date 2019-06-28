import React, { createContext, useReducer } from 'react';

export const WebcamDraggableContext = createContext();

const initialState = {
  dragging: false,
};

const reducer = (state, action) => {
  switch (action) {
    case 'dragStart': {
      return {
        ...state,
        dragging: true,
      };
    }
    case 'dragEnd': {
      return {
        ...state,
        dragging: false,
      };
    }
    default: {
      throw new Error('Unexpected action');
    }
  }
};

const ContextConsumer = Component => props => (
  <WebcamDraggableContext.Consumer>
    {contexts => <Component {...props} {...contexts} />}
  </WebcamDraggableContext.Consumer>
);

const ContextProvider = (props) => {
  const [reduceState, reduceDispatch] = useReducer(reducer, initialState);
  const { children } = props;
  return (
    <WebcamDraggableContext.Provider value={{
      reduceState,
      reduceDispatch,
      ...props,
    }}
    >
      {children}
    </WebcamDraggableContext.Provider>
  );
};

const withProvider = Component => props => (
  <ContextProvider {...props}>
    <Component />
  </ContextProvider>
);

const withConsumer = Component => ContextConsumer(Component);

const withDraggableContext = Component => withProvider(withConsumer(Component));

export {
  withProvider,
  withConsumer,
  withDraggableContext,
};
