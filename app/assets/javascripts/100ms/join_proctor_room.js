/* eslint-disable no-undef */
document.getElementById('join-proctoring-room-btn').addEventListener(
  'click', () => {
    document.getElementById('join-proctoring-room-btn').classList.add('d-none');
    document.getElementById('loader').classList.remove('d-none');

    const userData = document.getElementById('proctoring-user-data');
    const {
      userId,
      eventId,
      maxProctorAllowed,
    } = userData.dataset;
    connectToVideoProctoringRoom({
      userId, eventId, maxPeopleAllowed: maxProctorAllowed, userRole: 'proctor'
    });
  },
);
