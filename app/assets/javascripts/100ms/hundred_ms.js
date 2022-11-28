import { selectIsConnectedToRoom, selectPeers } from "https://cdn.skypack.dev/@100mslive/hms-video-store";

const errorCodes = {
  CAPTURE_DEVICE: '3002',
  ICE_CONNECTION_FAILED: '4005'
}

const connectToRoom = (props, renderPeers, onConnection, hmsStore, hmsActions, hmsNotifications) => {
  const setLocalStorageWithExpiry = (key, value, expiry) => {
    const data = {
      authToken: value,
      ttl: Date.now() + (expiry * 1000),
    }

    localStorage.setItem(key, JSON.stringify(data));
  }

  const getLocalStorageItem = (key) => {
    const data = localStorage.getItem(key);

    if(!data) {
      return null;
    }

    const item = JSON.parse(data);

    if(Date.now() > item.ttl){
      localStorage.removeItem(key);
      return null;
    }

    return item.authToken;
  }

  const isAudioMuted = (userRole) => {
    switch(userRole) {
      case 'candidates':
        return false;
      default:
        return true;
    }
  }

  const isVideoMuted = (userRole) => {
    switch(userRole) {
      case 'candidates':
        return false;
      default:
        return true;
    }
  }

  hmsNotifications.onNotification((notification) => {
    switch(notification.data.code){
      case errorCodes.CAPTURE_DEVICE:
      case errorCodes.ICE_CONNECTION_FAILED:
        joinVideoProctoring(props);
        break;
      default:
        return null;
    }
  });

  const joinRoom = async (props) => {
    await hmsActions.join(
      {
        userName: props.userId,
        authToken: props.authToken,
        settings: {
          isAudioMuted: isAudioMuted(props.userRole),
          isVideoMuted: isVideoMuted(props.userRole)
        },
        metadata: JSON.stringify({
          user_id: props.userId,
        }),
        rememberDeviceSelection: true
      }
    )
  }

  const fetchAuthenticationToken = (props) => {
    const url = '/proctoring/api/v1/authentication';
    const csrfMeta = document.getElementsByName('csrf-token');
    const token = csrfMeta[0] ? csrfMeta[0].content : '';
    const data = {
      user_id: props.userId,
      role: props.userRole,
      event_id: props.eventId,
      max_people_allowed: props.maxPeopleAllowed
    }
    const applicationToken = document.getElementById('application-token');

    return fetch(url, {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': token,
        'Token': applicationToken.dataset.token,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then((response) => response.json())
    .then((result) => result)
    .catch((error) => console.log(error))
  }

  const setEventId = (props) => {
    const connectedEvent = document.getElementById('connected-event');
    connectedEvent.innerHTML = props.eventId;
  }

  const joinVideoProctoring = (props) => {
    const authTokenKey = `authToken-${props.eventId}-${props.userId}`;
    const authToken = getLocalStorageItem(authTokenKey);

    if(props.userRole === 'proctor') setEventId(props);

    if(authToken){
      joinRoom({ userId: props.userId, authToken: authToken, userRole: props.userRole });
    } else {
      fetchAuthenticationToken(props).then((result) => {
        if(result.success){
          setLocalStorageWithExpiry(authTokenKey, result.authentication_token, 2 * 60 * 60);
          joinRoom({ userId: props.userId, authToken: result.authentication_token, userRole: props.userRole });
        }
      })
    }
  }

  joinVideoProctoring(props);

  const leaveRoom = () => {
    hmsActions.leave();
  }

  window.onunload = leaveRoom;

  hmsStore.subscribe(renderPeers, selectPeers);
  hmsStore.subscribe(onConnection, selectIsConnectedToRoom);
}

window.connectToRoom = connectToRoom;