const db = require('../db');
const line = require('@line/bot-sdk');

// สร้าง LINE client
const config = {
  channelAccessToken: process.env.LINE_BOT_ACCESS_TOKEN,
  channelSecret: process.env.LINE_BOT_CHANNEL_SECRET
};

const client = new line.Client(config);

// จัดการ webhook events
exports.handleWebhook = async (req, res) => {
  try {
    const events = req.body.events;
    console.log('📨 Received LINE Webhook:', events);

    // ตรวจสอบว่ามี events หรือไม่
    if (!events || !events.length) {
      return res.status(200).send('No events');
    }

    // ประมวลผลแต่ละ event
    const results = await Promise.all(events.map(async (event) => {
      try {
        switch (event.type) {
          case 'message':
            return handleMessageEvent(event);
          case 'follow':
            return handleFollowEvent(event);
          case 'unfollow':
            return handleUnfollowEvent(event);
          default:
            console.log(`⚠️ Unhandled event type: ${event.type}`);
            return null;
        }
      } catch (err) {
        console.error(`❌ Error handling event: ${err.message}`);
        return null;
      }
    }));

    console.log('✅ Processed events:', results);
    res.status(200).json({ status: 'success', processed: results.length });
  } catch (err) {
    console.error('❌ Webhook Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// จัดการ message events
async function handleMessageEvent(event) {
  const { replyToken, message, source } = event;

  try {
    switch (message.type) {
      case 'text':
        // ตอบกลับข้อความอัตโนมัติ
        await client.replyMessage(replyToken, {
          type: 'text',
          text: `ขอบคุณสำหรับข้อความ: "${message.text}"\nเราจะตอบกลับโดยเร็วที่สุด`
        });
        break;

      default:
        console.log(`⚠️ Unhandled message type: ${message.type}`);
    }

    return { success: true, type: 'message', messageType: message.type };
  } catch (err) {
    console.error('❌ Message handling error:', err);
    return { success: false, error: err.message };
  }
}

// จัดการ follow events
async function handleFollowEvent(event) {
  try {
    const { replyToken, source } = event;
    
    // ส่งข้อความต้อนรับ
    await client.replyMessage(replyToken, {
      type: 'text',
      text: 'ขอบคุณที่เพิ่มเราเป็นเพื่อน! 🎉\nเราจะแจ้งข่าวสารและการแจ้งเตือนต่างๆ ให้คุณทราบ'
    });

    return { success: true, type: 'follow' };
  } catch (err) {
    console.error('❌ Follow handling error:', err);
    return { success: false, error: err.message };
  }
}

// จัดการ unfollow events
async function handleUnfollowEvent(event) {
  try {
    const { source } = event;
    console.log(`👋 User unfollowed: ${source.userId}`);
    return { success: true, type: 'unfollow' };
  } catch (err) {
    console.error('❌ Unfollow handling error:', err);
    return { success: false, error: err.message };
  }
}