const menu = {
   ChatBot: ["1. BMWCCI 🔎", "2. Informasi Umum & Kegiatan 🎊", "3. Pendaftaran Member BMWCCI Jakarta Chapter 💎", "4. Check Anggota 👯", "5. Informasi Event 🔊"],
}

const limit = {
   free: 15,
   premium: 150,
   VIP: "Infinity",
   download: {
      free: 50000000,
      premium: 350000000,
      VIP: 1130000000,
   }
}

export default {
   limit,
   menu,
   options: {
      public: true,
      antiCall: true, 
      database: "database.json", 
      owner: ["6281281524356", "6281387127332"], 
      sessionName: "session",
      prefix: /^[°•π÷×¶∆£¢€¥®™+✓_=|/~!?@#%^&.©^]/i,
      pairingNumber: "6287777431550"
   },

   Exif: {
      packId: "https://bmwcci.org",
      packName: `Sticker Ini Dibuat Oleh :`,
      packPublish: "X - ZhnDvs",
      packEmail: "admin@bintanginovasiteknologi.com",
      packWebsite: "https://bmwcci.org",
   },

   // message  response awikwok there
   msg: {
      owner: "Features can only be accessed owner!",
      group: "Features only accessible in group!",
      private: "Features only accessible private chat!",
      admin: "Features can only be accessed by group admin!",
      botAdmin: "Bot is not admin, can't use the features!",
      bot: "Features only accessible by me",
      media: "Reply media...",
      query: "No Query?",
      error: "Seems to have encountered an unexpected error, please repeat your command for a while again",
      quoted: "Reply message...",
      wait: "Wait a minute...",
      urlInvalid: "Url Invalid",
      notFound: "Result Not Found!",
      premium: "Premium Only Features!",
      vip: "VIP Only Features!",
      dlFree: `File over ${formatSize(limit.download.free)} can only be accessed by premium users`,
      dlPremium: `WhatsApp cannot send files larger than ${formatSize(limit.download.premium)}`,
      dlVIP: `WhatsApp cannot send files larger than ${formatSize(limit.download.VIP)}`
   }
}


function formatSize(bytes, si = true, dp = 2) {
   const thresh = si ? 1000 : 1024;

   if (Math.abs(bytes) < thresh) {
      return `${bytes} B`;
   }

   const units = si
      ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
      : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
   let u = -1;
   const r = 10 ** dp;

   do {
      bytes /= thresh;
      ++u;
   } while (
      Math.round(Math.abs(bytes) * r) / r >= thresh &&
      u < units.length - 1
   );

   return `${bytes.toFixed(dp)} ${units[u]}`;
}