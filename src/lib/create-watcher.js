const {
  WebClient,
  RtmClient,
  CLIENT_EVENTS,
  RTM_EVENTS,
} = require('@slack/client');

function fetchChannelIdFromName(token, channelNames) {
  const webClient = new WebClient(token);
  return webClient.channels.list().then((resp) => {
    const channels = resp.channels || [];
    return channelNames
      .map(name => channels.find(c => name === c.name))
      .filter(c => c).map(c => c.id);
  });
}

function connectRtm(token, channelIds, onReceiveURL, onClose) {
  const rtm = new RtmClient(token);

  rtm.on(CLIENT_EVENTS.RTM.DISCONNECT, onClose);
  rtm.on(CLIENT_EVENTS.RTM.WS_CLOSE, onClose);
  rtm.on(CLIENT_EVENTS.RTM.WS_ERROR, onClose);

  rtm.on(RTM_EVENTS.MESSAGE, (data) => {
    console.log(data);
    if (!channelIds.includes(data.channel)) return;
    console.log('ok');
    let attachments;
    switch (data.subtype) {
      case 'message_changed':
        attachments = data.message.attachments;
        break;
      default:
        if (data.reply_to) return;
        attachments = data.attachments;
    }
    (attachments || []).forEach((attachment) => {
      if (!attachment.image_url && !attachment.thumb_url) return;
      onReceiveURL(attachment.image_url || attachment.thumb_url);
    });
  });

  rtm.start();
  return rtm;
}

function createWatcher(params = {}) {
  const {
    token,
    channelNames,
    onReceiveURL,
    onClose,
  } = params;

  return fetchChannelIdFromName(token, channelNames)
    .then((channelIds) => {
      console.log(channelIds);
      return connectRtm(token, channelIds, onReceiveURL, onClose);
    });
}

module.exports = createWatcher;
