import React, { Component, Fragment } from 'react';
import Draggable from 'react-draggable';
import cx from 'classnames';
import * as _ from 'lodash';
import { withDraggableContext } from './context';
// import useSessionState from './service';
import VideoProviderContainer from '/imports/ui/components/video-provider/container';
import { styles } from '../styles.scss';
import Storage from '../../../services/storage/session';
// import getFromUserSettings from '../../../services/users-settings';

const { webcamsDefaultPlacement } = Meteor.settings.public.layout;

class WebcamDraggable extends Component {
  static waitFor(condition, callback) {
    const cond = condition();
    if (!cond) {
      setTimeout(WebcamDraggable.waitFor.bind(null, condition, callback), 500);
    } else {
      callback();
    }
    return false;
  }

  constructor(props) {
    super(props);

    this.position = {
      x: 0,
      y: 0,
    };

    this.handleWebcamDragStart = this.handleWebcamDragStart.bind(this);
    this.handleWebcamDragStop = this.handleWebcamDragStop.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', _.debounce(this.onResize.bind(this), 500));
  }

  componentDidUpdate() {
    // console.log('=======> Media Bounds', this.getMediaBounds());
  }

  // videoMounted() {
  //
  // }

  onResize() {
    console.log('===== RESIZE =====');
    const { reduceState, reduceDispatch } = this.props;
    const { mediaSize } = reduceState;
    const { width: stateWidth, height: stateHeight } = mediaSize;
    const { width, height } = this.getMediaBounds();

    if (stateWidth !== width || stateHeight !== height) {
      console.log('mudou!!');
      reduceDispatch(
        {
          type: 'setMediaSize',
          value: {
            width,
            height,
          },
        },
      );
      // this.forceUpdate();
    } else {
      console.log('não mudou!!');
    }
  }

  getMediaBounds() {
    const { refMediaContainer, reduceState, reduceDispatch } = this.props;
    const { mediaSize: mediaState } = reduceState;
    const { current: mediaContainer } = refMediaContainer;
    if (mediaContainer) {
      const mediaContainerRect = mediaContainer.getBoundingClientRect();
      const {
        top, left, width, height,
      } = mediaContainerRect;

      if (mediaState.width === 0 || mediaState.height === 0) {
        reduceDispatch(
          {
            type: 'setMediaSize',
            value: {
              width,
              height,
            },
          },
        );
      }

      return {
        top,
        left,
        width,
        height,
      };
    }
    return false;
  }

  getWebcamsListBounds() {
    const { reduceState } = this.props;
    const { videoListRef } = reduceState;
    if (videoListRef) {
      const videoListRefRect = videoListRef.getBoundingClientRect();
      const {
        top, left, width, height,
      } = videoListRefRect;
      return {
        top,
        left,
        width,
        height,
      };

    }
    return false;
  }

  calculatePosition() {
    const { top: mediaTop, left: mediaLeft } = this.getMediaBounds();
    const { top: webcamsListTop, left: webcamsListLeft } = this.getWebcamsListBounds();
    console.log('webcamsListLeft', webcamsListLeft);
    console.log('mediaLeft', mediaLeft);
    console.log('webcamsListTop', webcamsListTop);
    console.log('mediaTop', mediaTop);
    const x = webcamsListLeft - mediaLeft;
    const y = webcamsListTop - mediaTop;
    return {
      x,
      y,
    };
  }

  async handleWebcamDragStart(e, position) {
    const { reduceDispatch, shouldFloating } = this.props;
    const { x, y } = await this.calculatePosition();

    reduceDispatch({ type: 'dragStart' });

    reduceDispatch(
      {
        type: 'setTempPosition',
        value: {
          x: shouldFloating ? x : 0,
          y,
        },
      },
    );
  }

  handleWebcamDragStop(e, position) {
    // console.log('===> target: ', e.target);
    // console.log('===> target: ', e.target.className.includes('Top'));
    const { reduceDispatch, shouldFloating } = this.props;
    const targetClassname = e.target.className;
    const { x, y } = position;

    if (targetClassname.includes('Top')) {
      reduceDispatch({ type: 'setplacementToTop' });
    } else if (targetClassname.includes('Bottom')) {
      reduceDispatch({ type: 'setplacementToBottom' });
    } else if (shouldFloating) {
      reduceDispatch(
        {
          type: 'setLastPosition',
          value: {
            x,
            y,
          },
        },
      );
      reduceDispatch({ type: 'setplacementToFloating' });
    }
    reduceDispatch({ type: 'dragEnd' });
  }

  render() {
    console.log('===== RENDER =====');
    const {
      reduceState,
      shouldFloating,
      swapLayout,
      hideOverlay,
      disableVideo,
      audioModalIsOpen,
      usersVideoLenght,
      // refMediaContainer,
      // usersVideo,
    } = this.props;

    const { dragging } = reduceState;
    let placement = Storage.getItem('webcamPlacement');
    let position = Storage.getItem('webcamLastPosition');
    if (!placement) {
      placement = webcamsDefaultPlacement;
    }

    const {
      top: mediaTop,
      left: mediaLeft,
      width: mediaWidth,
      height: mediaHeight
    } = this.getMediaBounds();

    const {
      left: webcamsLeft,
      width: webcamsWidth,
      height: webcamsHeight,
    } = this.getWebcamsListBounds();

    if (dragging) {
      position = reduceState.tempPosition;
    } else if (!dragging && placement === 'floating' && shouldFloating) {
      position = reduceState.lastPosition;
    } else {
      position = {
        x: 0,
        y: 0,
      };
    }
    console.log('position.x: ', position.x);

    const isOverflowWidth = ((webcamsLeft - mediaLeft) + webcamsWidth) > mediaWidth;

    if (isOverflowWidth) {
      position = {
        x: mediaWidth - webcamsWidth,
      };
    }

    console.log('position.x: ', position.x);
    console.log('mediaWidth: ', mediaWidth);
    console.log('webcamsWidth: ', webcamsWidth);

    // if (position.y > (mediaHeight - webcamsHeight)) {
    //   position = {
    //     y: mediaHeight - webcamsHeight,
    //   };
    // }

    // console.log('placement', placement);
    // console.log('webcamsDefaultPlacement: ', webcamsDefaultPlacement);
    // console.log('reduceState: ', dragging);

    const contentClassName = cx({
      [styles.content]: true,
    });

    const overlayClassName = cx({
      [styles.overlay]: true,
      [styles.hideOverlay]: hideOverlay,
      [styles.floatingOverlay]: (shouldFloating && placement === 'floating') || dragging,
      [styles.fit]: shouldFloating && (placement === 'floating' || dragging),
      [styles.full]: (placement === 'top' || placement === 'bottom' || usersVideoLenght > 1) && !dragging,
      [styles.overlayToTop]: (placement === 'floating' && !shouldFloating) || (placement === 'top' && !dragging),
      [styles.overlayToBottom]: placement === 'bottom' && !dragging,
      [styles.dragging]: dragging,
    });

    const dropZoneTopClassName = cx({
      [styles.dropZoneTop]: true,
      [styles.show]: dragging,
      [styles.hide]: !dragging,
    });

    const dropZoneBottomClassName = cx({
      [styles.dropZoneBottom]: true,
      [styles.show]: dragging,
      [styles.hide]: !dragging,
    });

    const dropZoneBgTopClassName = cx({
      [styles.dropZoneBgTop]: true,
    });

    const dropZoneBgBottomClassName = cx({
      [styles.dropZoneBgBottom]: true,
    });

    return (<Fragment>
      <div
        className={dropZoneTopClassName}
        style={{ height: !shouldFloating ? '50%' : '20%' }}
      >
        <div
          className={dropZoneBgTopClassName}
        />
      </div>

      <Draggable
        handle="video"
        bounds="#container"
        onStart={this.handleWebcamDragStart}
        onStop={this.handleWebcamDragStop}
        onMouseDown={e => e.preventDefault()}
        // disabled={swapLayout || isFullScreen || BROWSER_ISMOBILE || isMinWidth}
        position={position}
      >
        <div
          className={!swapLayout ? overlayClassName : contentClassName}
          style={{
            // maxHeight: mediaHeight,
          }}
        >
          {!disableVideo && !audioModalIsOpen ? (<VideoProviderContainer
            // cursor={cursor()}
            swapLayout={swapLayout}
            // onMount={this.videoMounted}
          />) : null}
        </div>
      </Draggable>

      <div
        className={dropZoneBottomClassName}
        style={{ height: !shouldFloating ? '50%' : '20%' }}
      >
        <div
          className={dropZoneBgBottomClassName}
        />
      </div>
    </Fragment>);
  }
}

export default withDraggableContext(WebcamDraggable);
