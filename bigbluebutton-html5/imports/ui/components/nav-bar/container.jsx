import React, { useContext } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import getFromUserSettings from '/imports/ui/services/users-settings';
import userListService from '/imports/ui/components/user-list/service';
import { ChatContext } from '/imports/ui/components/components-data/chat-context/context';
import { GroupChatContext } from '/imports/ui/components/components-data/group-chat-context/context';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import NoteService from '/imports/ui/components/note/service';
import Service from './service';
import NavBar from './component';
import { NLayoutContext } from '../layout/context/context';

const PUBLIC_CONFIG = Meteor.settings.public;
const ROLE_MODERATOR = PUBLIC_CONFIG.user.role_moderator;

const checkUnreadMessages = ({ groupChatsMessages, groupChats, users }) => {
  const activeChats = userListService.getActiveChats({ groupChatsMessages, groupChats, users });
  const hasUnreadMessages = activeChats
    .filter(chat => chat.userId !== Session.get('idChatOpen'))
    .some(chat => chat.unreadCounter > 0);

  return hasUnreadMessages;
};

const NavBarContainer = ({ children, ...props }) => {
  const usingChatContext = useContext(ChatContext);
  const usingUsersContext = useContext(UsersContext);
  const usingGroupChatContext = useContext(GroupChatContext);
  const newLayoutContext = useContext(NLayoutContext);
  const { chats: groupChatsMessages } = usingChatContext;
  const { users } = usingUsersContext;
  const { groupChat: groupChats } = usingGroupChatContext;
  const hasUnreadMessages = checkUnreadMessages({ groupChatsMessages, groupChats, users });
  const { output, sidebarNavPanel, sidebarContentPanel } = newLayoutContext.newLayoutContextState;
  const hasUnreadNotes = NoteService.hasUnreadNotes(sidebarContentPanel);
  const {
    layoutManagerLoaded,
    ...rest
  } = props;
  const { navBar } = output;

  return (
    <NavBar
      {...{
        hasUnreadMessages,
        hasUnreadNotes,
        layoutManagerLoaded,
        sidebarNavPanel,
        sidebarContentPanel,
        ...rest,
      }}
      style={{ ...navBar }}
    >
      {children}
    </NavBar>
  );
};

export default withTracker(() => {
  const CLIENT_TITLE = getFromUserSettings('bbb_client_title', PUBLIC_CONFIG.app.clientTitle);

  let meetingTitle;
  const meetingId = Auth.meetingID;
  const meetingObject = Meetings.findOne({
    meetingId,
  }, { fields: { 'meetingProp.name': 1, 'breakoutProps.sequence': 1 } });

  if (meetingObject != null) {
    meetingTitle = meetingObject.meetingProp.name;
    let titleString = `${CLIENT_TITLE} - ${meetingTitle}`;
    if (meetingObject.breakoutProps) {
      const breakoutNum = meetingObject.breakoutProps.sequence;
      if (breakoutNum > 0) {
        titleString = `${breakoutNum} - ${titleString}`;
      }
    }
    document.title = titleString;
  }

  const { connectRecordingObserver, processOutsideToggleRecording } = Service;
  const currentUser = Users.findOne({ userId: Auth.userID }, { fields: { role: 1 } });
  const amIModerator = currentUser.role === ROLE_MODERATOR;


  const layoutManagerLoaded = Session.get('layoutManagerLoaded');

  return {
    amIModerator,
    currentUserId: Auth.userID,
    processOutsideToggleRecording,
    connectRecordingObserver,
    meetingId,
    presentationTitle: meetingTitle,
    layoutManagerLoaded,
  };
})(NavBarContainer);
