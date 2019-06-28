import React, { Component, Fragment } from 'react';
import Draggable from 'react-draggable';
import cx from 'classnames';
import { withDraggableContext } from './context';
// import useSessionState from './service';
import VideoProviderContainer from '/imports/ui/components/video-provider/container';
import { styles } from '../styles.scss';
import Storage from '../../../services/storage/session';
// import getFromUserSettings from '../../../services/users-settings';

const { webcamsDefaultPlacement } = Meteor.settings.public.layout;

class WebcamDraggable extends Component {
  // constructor(props) {
  //   super(props);
  //
  //   this.state = {
  //     placement: 'top',
  //   };
  // }

  componentDidMount() {
    console.log(this.props);
  }

  componentDidUpdate() {
    const {
      floatingOverlay,
    } = this.props;
    const placement = Storage.getItem('webcamPlacement');
    if (floatingOverlay && placement !== 'floating') {
      Storage.setItem('webcamPlacement', 'floating');
    }
  }

  render() {
    console.log('props', this.props);
    const {
      reduceState,
      floatingOverlay,
      swapLayout,
      hideOverlay,
      disableVideo,
      audioModalIsOpen,
      // refMediaContainer,
      // usersVideo,
    } = this.props;

    const { dragging } = reduceState;

    let placement = Storage.getItem('webcamPlacement');
    if (!placement) {
      placement = webcamsDefaultPlacement;
    }

    console.log('placement', placement);
    console.log('webcamsDefaultPlacement: ', webcamsDefaultPlacement);

    const contentClassName = cx({
      [styles.content]: true,
    });

    const overlayClassName = cx({
      [styles.overlay]: true,
      [styles.hideOverlay]: hideOverlay,
      [styles.floatingOverlay]: placement === 'floating',
      [styles.overlayToTop]: placement === 'top',
      [styles.overlayToBottom]: placement === 'bottom',
      [styles.dragging]: dragging,
    });

    const dropZoneTopClassName = cx({
      [styles.dropZoneTop]: true,
      [styles.show]: dragging,
    });

    const dropZoneBottomClassName = cx({
      [styles.dropZoneBottom]: true,
      [styles.show]: dragging,
    });

    const dropZoneBgTopClassName = cx({
      [styles.dropZoneBgTop]: true,
      // [styles.top]: true,
      // [styles.show]: showBgDropZoneTop,
      // [styles.hide]: !showBgDropZoneTop,
    });

    const dropZoneBgBottomClassName = cx({
      [styles.dropZoneBgBottom]: true,
      // [styles.bottom]: true,
      // [styles.show]: showBgDropZoneBottom,
      // [styles.hide]: !showBgDropZoneBottom,
    });

    return (
      <Fragment>
        <div
          className={dropZoneTopClassName}
          // onMouseEnter={this.dropZoneTopEnterHandler}
          // onMouseLeave={this.dropZoneTopLeaveHandler}
          // onMouseUp={this.dropZoneTopMouseUpHandler}
          style={{ height: !floatingOverlay ? '50%' : '20%' }}
        >
          <div
            className={dropZoneBgTopClassName}
            style={{ height: !floatingOverlay ? '50%' : '20%' }}
          />
        </div>

        <Draggable
          handle="video"
          bounds="#container"
          onStart={this.handleWebcamDragStart}
          onStop={this.handleWebcamDragStop}
          onMouseDown={e => e.preventDefault()}
          // disabled={swapLayout || isFullScreen || BROWSER_ISMOBILE || isMinWidth}
          // position={resetPosition || swapLayout ? initialPosition : lastPosition}
        >
          <div
            className={!swapLayout ? overlayClassName : contentClassName}
            style={{
              // maxHeight: mediaHeight,
            }}
          >
            {
              !disableVideo && !audioModalIsOpen
                ? (
                  <VideoProviderContainer
                    // cursor={cursor()}
                    swapLayout={swapLayout}
                    // onMount={this.videoMounted}
                  />
                ) : null}
          </div>
        </Draggable>

        <div
          className={dropZoneBottomClassName}
          // onMouseEnter={this.dropZoneBottomEnterHandler}
          // onMouseLeave={this.dropZoneBottomLeaveHandler}
          // onMouseUp={this.dropZoneBottomMouseUpHandler}
          style={{ height: !floatingOverlay ? '50%' : '20%' }}
        >
          <div
            className={dropZoneBgBottomClassName}
            style={{ height: !floatingOverlay ? '50%' : '20%' }}
          />
        </div>
      </Fragment>
    );
  }
}

//   render() {
//     return (
//       <Fragment>
//         <div
//           style={{
//             background: '#fff',
//           }}
//         >
//           {JSON.stringify(this.props.reduceState)}
//         </div>
//         <button
//           onClick={() => this.props.reduceDispatch('dragStart')}
//         >
//           Start
//         </button>
//         <button
//           onClick={() => this.props.reduceDispatch('dragEnd')}
//         >
//           End
//         </button>
//       </Fragment>
//
//     );
//   }
// }

export default withDraggableContext(WebcamDraggable);
