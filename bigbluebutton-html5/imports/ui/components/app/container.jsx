import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Auth from '/imports/ui/services/auth';
import AuthTokenValidation from '/imports/api/auth-token-validation';
import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import { notify } from '/imports/ui/services/notification';
import CaptionsContainer from '/imports/ui/components/captions/container';
import CaptionsService from '/imports/ui/components/captions/service';
import getFromUserSettings from '/imports/ui/services/users-settings';
import deviceInfo from '/imports/utils/deviceInfo';
import UserInfos from '/imports/api/users-infos';
import { startBandwidthMonitoring, updateNavigatorConnection } from '/imports/ui/services/network-information/index';
import NewLayoutContext from '../layout/context/context';

import {
  getFontSize,
  getBreakoutRooms,
  validIOSVersion,
} from './service';

import { withModalMounter } from '../modal/service';

import App from './component';
import ActionsBarContainer from '../actions-bar/container';
import MediaContainer from '../media/container';

const propTypes = {
  actionsbar: PropTypes.node,
  media: PropTypes.node,
};

const defaultProps = {
  actionsbar: <ActionsBarContainer />,
  media: <MediaContainer />,
};

const intlMessages = defineMessages({
  waitingApprovalMessage: {
    id: 'app.guest.waiting',
    description: 'Message while a guest is waiting to be approved',
  },
});

const endMeeting = (code) => {
  Session.set('codeError', code);
  Session.set('isMeetingEnded', true);
};

const AppContainer = (props) => {
  const {
    actionsbar,
    media,
    newLayoutContextState,
    newLayoutContextDispatch,
    ...otherProps
  } = props;
  const { layoutType, deviceType } = newLayoutContextState;


  return (
    <App
      actionsbar={actionsbar}
      media={media}
      layoutType={layoutType}
      deviceType={deviceType}
      newLayoutContextDispatch={newLayoutContextDispatch}
      {...otherProps}
    />
  );
};

const currentUserEmoji = currentUser => (currentUser
  ? {
    status: currentUser.emoji,
    changedAt: currentUser.emojiTime,
  }
  : {
    status: 'none',
    changedAt: null,
  }
);

export default injectIntl(withModalMounter(withTracker(({ intl, baseControls }) => {
  const authTokenValidation = AuthTokenValidation.findOne({}, { sort: { updatedAt: -1 } });

  if (authTokenValidation.connectionId !== Meteor.connection._lastSessionId) {
    endMeeting('403');
  }

  Users.find({ userId: Auth.userID, meetingId: Auth.meetingID }).observe({
    removed() {
      endMeeting('403');
    },
  });

  const currentUser = Users.findOne({ userId: Auth.userID },
    { fields: { approved: 1, emoji: 1, userId: 1 } });
  const currentMeeting = Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { publishedPoll: 1, voiceProp: 1, randomlySelectedUser: 1 } });
  const { publishedPoll, voiceProp, randomlySelectedUser } = currentMeeting;

  if (!currentUser.approved) {
    baseControls.updateLoadingState(intl.formatMessage(intlMessages.waitingApprovalMessage));
  }

  const UserInfo = UserInfos.find({
    meetingId: Auth.meetingID,
    requesterUserId: Auth.userID,
  }).fetch();

  const layoutManagerLoaded = Session.get('layoutManagerLoaded');

  return {
    captions: CaptionsService.isCaptionsActive() ? <CaptionsContainer /> : null,
    fontSize: getFontSize(),
    hasBreakoutRooms: getBreakoutRooms().length > 0,
    customStyle: getFromUserSettings('bbb_custom_style', false),
    customStyleUrl: getFromUserSettings('bbb_custom_style_url', false),
    openPanel: Session.get('openPanel'),
    UserInfo,
    notify,
    validIOSVersion,
    isPhone: deviceInfo.type().isPhone,
    isRTL: document.documentElement.getAttribute('dir') === 'rtl',
    meetingMuted: voiceProp.muteOnStart,
    currentUserEmoji: currentUserEmoji(currentUser),
    hasPublishedPoll: publishedPoll,
    startBandwidthMonitoring,
    handleNetworkConnection: () => updateNavigatorConnection(navigator.connection),
    layoutManagerLoaded,
    randomlySelectedUser,
    currentUserId: currentUser.userId,
  };
})(NewLayoutContext.withConsumer(AppContainer))));

AppContainer.defaultProps = defaultProps;
AppContainer.propTypes = propTypes;
