import config from "../config.js";
import Func from "../lib/function.js";

import fs from "fs";
import moment from "moment-timezone";
import chalk from "chalk";
import axios from "axios";
import path from "path";
import { getBinaryNodeChildren } from "@whiskeysockets/baileys";
import { exec } from "child_process";
import { format } from "util";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const __filename = Func.__filename(import.meta.url);
const require = createRequire(import.meta.url);

let event = JSON.parse(fs.readFileSync("./database/event.json"));

export default async function Message(zhn, m, chatUpdate) {
  try {
    if (!m) return;
    if (!config.options.public && !m.isOwner) return;
    if (m.from && db.groups[m.from]?.mute && !m.isOwner) return;
    if (m.isBaileys) return;

    (await import("../lib/loadDatabase.js")).default(m);

    const prefix = m.prefix;
    const isCmd = m.body.startsWith(prefix);
    const command = isCmd ? m.command.toLowerCase() : "";
    const quoted = m.isQuoted ? m.quoted : m;

    // LOG Chat
    if (m.message && !m.isBaileys) {
      console.log(
        chalk.black(chalk.bgWhite("- FROM")),
        chalk.black(chalk.bgGreen(m.pushName)),
        chalk.black(chalk.yellow(m.sender)) +
          "\n" +
          chalk.black(chalk.bgWhite("- IN")),
        chalk.black(
          chalk.bgGreen(m.isGroup ? m.metadata.subject : "Private Chat", m.from)
        ) +
          "\n" +
          chalk.black(chalk.bgWhite("- MESSAGE")),
        chalk.black(chalk.bgGreen(m.body || m.type))
      );
    }

    switch (command) {
      case "menu":
      case "help":
      case "halo":
      case "hai":
      case "hi":
        {
          let text = `Halo @${m.sender.split`@`[0]}, Selamat datang di BMW Cars Club Indonesia Jakarta Chapter, ChatBot Seputar Informasi BMWCCI,\n\n*Total Command :* ${Object.values(config.menu).map((a) => a.length).reduce((total, num) => total + num, 0)}\n`;
          Object.entries(config.menu).map(([type, command]) => {
              text += `\n`;
              text += `⎚ ${command.map((a) => `${a}`).join("\n⎚ ")}\n`;
              text += `\n`;
              text += `\n\n`;
              text += `Silakan pilih salah satu menu di atas, dengan mengetikkan angkanya, lalu tekan tombol kirim.\n\n`;
              text += `Mari berbagi ! ⏩\nCopy/paste https://wa.me/6287777431550?text=halo`;
            }).join("\n\n");

          return zhn.sendMessage(m.from,
            {
              text,
              contextInfo: {
                mentionedJid: zhn.parseMention(text),
                externalAdReply: {
                  title: zhn?.user?.name,
                  mediaType: 1,
                  previewType: 0,
                  renderLargerThumbnail: true,
                  thumbnail: fs.readFileSync("./temp/BMWJC Logo.jpg"),
                  sourceUrl: config.Exif.packWebsite,
                },
              },
            },
            { quoted: m }
          );
        }
        break;
      case "addevent":
      case "createevent":
        if (!m.isOwner) return m.reply("Only Administrator Can Access this Command!");
        if (m.text.length < 3) return m.reply(`*${prefix}addevent* Title|Waktu|Content Event / Kegiatan`);
        if (!m.text.includes("|")) return m.reply(`*${prefix}addevent* Title|Waktu|Content Event / Kegiatan`);
        let objectEvent = {
          Title: m.text.split("|")[0],
          Time: m.text.split("|")[1],
          Content: m.text.split("|")[2],
        };
        event.push(objectEvent);
        fs.writeFileSync("./database/event.json", JSON.stringify(event, null, 2));
        m.reply(`Successfully Added New Event, Please Check on ${prefix}listevent`);
        break;
      case "delevent":
      case "deleteevent":
      case "hapusevent":
        if (!m.isOwner) return m.reply("Only Administrator Can Access this Command!");
        if (!m.text) return m.reply(`*${prefix}delevent* Title`);
        let objEvent = {
          Title: m.text.split("|")[0],
          Time: m.text.split("|")[1],
          Content: m.text.split("|")[2],
        };
        let index = event.findIndex((e) => {
          return e.Title === objEvent.Title;
        });
        if (index > -1) {
          event.splice(index, 1);
        }        
        fs.writeFileSync("./database/event.json", JSON.stringify(event, null, 2));
        m.reply(`Successfully Delete Event, Please Check on ${prefix}listevent`);
        break;
      // case 'listkegiatan':
      //       case 'listevent':
      //         if (!m.isOwner) return m.reply("Only Administrator Can Access this Command!");
      //           event.sort((a, b) => (a.Waktu < b.Waktu) ? 1 : -1)
      //           let chas = `「 *EVENT-BMWCCI* 」\n\n`
      //           for (let i = 0; i < event.length; i++){
      //               chas += `• *Title :* ${event[i].Title}\n• *Time :* ${moment(event[i].Time).tz('Asia/Jakarta').format('HH:mm:ss DD/MM/YYYY')}\n• *Description :* ${event[i].Content}\n\n`
      //           }
      //           m.reply(chas.trim())
      //           break
      case 'listkegiatan':
      case 'listevent':
        if (!m.isOwner) return m.reply("Only Administrator Can Access this Command!");

        event.sort((a, b) => (a.Waktu < b.Waktu) ? 1 : -1);

        async function sendEventsSequentially() {
          for (let i = 0; i < event.length; i++) {
            const currentEvent = event[i];
            const message = `「 *EVENT-BMWCCI* 」\n\n• *Title :* ${currentEvent.Title}\n• *Time :* ${currentEvent.Time}\n• *Description :* ${currentEvent.Content}\n\n`;
            await m.reply(message.trim());
            await Func.sleep(5)
          }
        }

        sendEventsSequentially(); // Call the asynchronous function
        break;
      case "1":
        {
        let text = `
BMWCCI didirikan pada 24 Mei 2003 di Jakarta Indonesia.  BMWCCI resmi menjadi anggota International BMW Club Organization dalam BMW Clubs Council Meeting di Pretoria, Afrika Selatan, pada hari Kamis, 14 Desember 2006. BMWCCI telah berkembang, dari 29 Chapter dan 2 Register dengan keanggotaan lebih dari 3000 anggota  dan tersebar di seluruh tanah air dan akan terus berkembang dengan adanya pengajuan dari daerah untuk menjadi bagian dari BMWCCI.  Awalnya calon klub anggota BMW mengusulkan nama klub BMW tersebut adalah BMW Club Indonesia.  Namun mengingat nama klub tersebut sebelumnya sudah ada, yaitu klub khusus sepeda motor BMW Motorrad Club Indonesia.,

Akhirnya disepakati nama klub tersebut diubah menjadi BMW Car Club of Indonesia (selanjutnya disebut BMWCCI).  Penamaan Klub disesuaikan dengan format nama Klub serupa di berbagai negara lain.  Dalam pertemuan di BMW Astra Jalan Proklamasi, para anggota BMWCCI sepakat untuk menyepakati rancangan Anggaran Dasar BMWCCI dan nama klub.  Maka lahirlah BMWCCI pada tanggal 24 Mei 2003 dengan jumlah anggota awal 23 orang.  Demikian pula latar belakang pekerjaan dan usia anggota BMWCCI.  Hal ini sesuai dengan sifat BMWCCI yang terbuka dan bebas.  Pada hari Kamis, 14 Desember 2006 BMWCCI resmi menjadi anggota Organisasi Klub BMW Internasional.  Secara resmi BMWCCI menjadi anggota International Council of BMW Clubs setelah pertemuan tahunan mereka di Pretoria, Afrika Selatan pada bulan Oktober 2006.
International BMW Club Organization sendiri didirikan pada tahun 1981 dan memiliki sekitar 600 klub dengan lebih dari 200.000 anggota di seluruh dunia.  Ini mencakup mobil BMW klasik dan mobil BMW baru, dengan tujuan yang sama adalah untuk berbagi slogan legendaris BMW “sheer driving pleasure"  Dengan berkembangnya anggota BMWCCI keluar Jakarta bahkan ke daerah maka muncul wacana untuk menciptakan perwakilan di daerah.  Dan saran dari Mantan Presiden Dewan Internasional BMW, Ian Branstom.  sebaiknya menjadikan Umbrella Club saja, semua menjadi wadah bagi seluruh Club di Indonesia kedepannya.  

Dengan adanya perubahan format tersebut maka nama Klub pun ikut berubah menjadi BMW Car Clubs Indonesia.  

Cirebon Chapter merupakan Club Member pertama yang menggunakan nama BMW Car Clubs Indonesia Chapter Cirebon.  VISI, BMWCCI sebagai klub yang mempunyai nilai tambah bagi para anggotanya, BMWCCI sebagai klub yang tidak hanya sebagai komunitas otomotif namun sebagai BMW Car Club yang solid dan terkenal di tingkat nasional dan internasional.  MISI, BMWCCI membentuk anggotanya yang solid, kompak dan kekeluargaan melalui acara-acara terkait yang dapat membawa nama baik BMWCCI.  Menumbuhkan rasa memiliki dan kecintaan para anggota terhadap klub dan kendaraannya.  Memberikan nilai tambah dan manfaat bagi anggota dan klub.  BMWCCI

https://bmwcci.org/about-us/`
      return zhn.sendMessage(m.from,
        {
          text,
          contextInfo: {
            mentionedJid: zhn.parseMention(text),
            externalAdReply: {
              title: zhn?.user?.name,
              mediaType: 1,
              previewType: 0,
              renderLargerThumbnail: true,
              thumbnail: fs.readFileSync("./temp/BMWJC Logo.jpg"),
              sourceUrl: config.Exif.packWebsite,
            },
          },
        },
        { quoted: m }
      );
        }
      break;
      case "2":
        {
        let text = `
Website BMWCCI 
https://bmwcci.org/

Social Media 
Instagram : www.instagram.com/bmwcci.official

Youtube : https://m.youtube.com/channel/UCeyIUWIIlcSQpUtmCzxC4Ig


Bmwcci Jakarta Chapter

1. Social Media 
Instagram : https://www.instagram.com/bmwcci.jakarta_chapter

Facebook : 
https://www.facebook.com/BmwcciJakartaChapter`
          return zhn.sendMessage(m.from,
          {
            text,
            contextInfo: {
              mentionedJid: zhn.parseMention(text),
              externalAdReply: {
                title: zhn?.user?.name,
                mediaType: 1,
                previewType: 0,
                renderLargerThumbnail: true,
                thumbnail: fs.readFileSync("./temp/BMWJC Logo.jpg"),
                sourceUrl: config.Exif.packWebsite,
              },
            },
          },
          { quoted: m }
        );
        }
        break
      case "3":
        {
        let text = `
FORMULIR PENDAFTARAN ANGGOTA BARU / RENEWAL
BMWCCI JAKARTA CHAPTER OFFICIAL CLUB
SYARAT DAN KETENTUAN
ANGGOTA BARU BMWCCI JAKARTA CHAPTER OFFICIAL CLUB

Persyaratan Anggota Baru BMWCCI Jakarta Chapter

1. Tidak aktif terdaftar di BMWCCI Chapter lain

2. Memiliki unit BMW

3. Domisili sekitar Jakarta, Depok, Tangerang dan Bekasi (JaDeTaBek)

4. Biaya pendaftaran baru sebesar Rp1.000.000,- (satu juta rupiah)
*Biaya renewal sebesar Rp500.000,- (lima ratus ribu rupiah)

5. Mengisi biodata secara lengkap
Pembayaran dapat ditransfer ke bendahara:
Bank : Mandiri, KCP Gedung Jamsostek
No Rek : 0700007516151
Atas Nama : BMWCCI Jakarta Chapter

6. Catatan: Harap nominal transfer ditambahkan Rp25,- dibelakangnya. (contoh transfer: Rp1.000.025)

Atribut dan Benefit
1 paket atribut (Kemeja, Kartu Identitas Elektronik, Stiker), minimal 3 bulan atribut dapat diterima oleh member setelah menjadi anggota

2. Masuk dalam Whatsapp Group
Program Kegiatan baik Event Nasional dan Internasional
Harga spesial dari kerjasama beberapa mitra

https://member.bmwccijakartachapter.org/register`
        return zhn.sendMessage(m.from,
          {
            text,
            contextInfo: {
              mentionedJid: zhn.parseMention(text),
              externalAdReply: {
                title: zhn?.user?.name,
                mediaType: 1,
                previewType: 0,
                renderLargerThumbnail: true,
                thumbnail: fs.readFileSync("./temp/BMWJC Logo.jpg"),
                sourceUrl: config.Exif.packWebsite,
              },
            },
          },
          { quoted: m }
        );
        }
        break
      case "4":
        {
          let text = '```We are working hard to make it even better for you, and we will let you know as soon as it is ready to go. In the meantime, you can still access all of our other awesome features. ✨Thanks for your patience! We appreciate you sticking with us```'
          return zhn.sendMessage(m.from,
            {
              text,
              contextInfo: {
                mentionedJid: zhn.parseMention(text),
                externalAdReply: {
                  title: zhn?.user?.name,
                  mediaType: 1,
                  previewType: 0,
                  renderLargerThumbnail: true,
                  thumbnail: fs.readFileSync("./temp/BMWJC Logo.jpg"),
                  sourceUrl: config.Exif.packWebsite,
                },
              },
            },
            { quoted: m }
          );
        }
        break
      case "5":
        {
          event.sort((a, b) => (a.Waktu < b.Waktu) ? 1 : -1);

          async function sendEvent() {
            for (let i = 0; i < event.length; i++) {
              const currentEvent = event[i];
              const message = `*${currentEvent.Title}*\n\nJadwal Event : ${currentEvent.Time}\n\n${currentEvent.Content}\n\n`;
              await m.reply(message.trim());
              await Func.sleep(5)
            }
          }

          sendEvent(); // Call the asynchronous function
          break;
        }

      case "admin":
      case "owner":
        {
          zhn.sendContact(m.from, config.options.owner, m);
        }
        break;
      case "sc":
        {
          m.reply("https://github.com/zxnabil354/chatbot-bmwcci");
        }
        break;
      case "ping":
        {
          const moment = (await import("moment-timezone")).default;
          const calculatePing = function (timestamp, now) {
            return moment.duration(now - moment(timestamp * 1000)).asSeconds();
          };
          m.reply(
            `*Ping :* *_${calculatePing(m.timestamp, Date.now())} second(s)_*`
          );
        }
        break;
      case "quoted":
      case "q":
        {
          const { Serialize } = await import("../lib/serialize.js");
          if (!m.isQuoted) m.reply("quoted");
          try {
            const message = await Serialize(
              zhn,
              await zhn.loadMessage(m.from, m.quoted.id)
            );
            if (!message.isQuoted) return m.reply("Quoted Not Found 🙄");
            zhn.sendMessage(m.from, { forward: message.quoted });
          } catch {
            m.reply("Quoted Not Found 🙄");
          }
        }
        break;

      /* Umm, maybe for owner menu  */
      case "public":
        {
          if (!m.isOwner) return m.reply("owner");
          if (config.options.public) {
            config.options.public = false;
            m.reply("Switch Bot To Self Mode");
          } else {
            config.options.public = true;
            m.reply("Switch Bot To Public Mode");
          }
        }
        break;
      case "mute":
        {
          if (!m.isOwner) return m.reply("owner");
          let db = global.db.groups[m.from];
          if (db.mute) {
            db.mute = false;
            m.reply("Succes Unmute This Group");
          } else if (!db.mute) {
            db.mute = true;
            m.reply("Succes Mute This Group");
          }
        }
        break;
      case "setpp":
      case "setprofile":
      case "seticon":
        {
          const media = await quoted.download();
          if (m.isOwner && !m.isGroup) {
            if (/full/i.test(m.text))
              await zhn.setProfilePicture(zhn?.user?.id, media, "full");
            else if (/(de(l)?(ete)?|remove)/i.test(m.text))
              await zhn.removeProfilePicture(zhn.decodeJid(zhn?.user?.id));
            else await zhn.setProfilePicture(zhn?.user?.id, media, "normal");
          } else if (m.isGroup && m.isAdmin && m.isBotAdmin) {
            if (/full/i.test(m.text))
              await zhn.setProfilePicture(m.from, media, "full");
            else if (/(de(l)?(ete)?|remove)/i.test(m.text))
              await zhn.removeProfilePicture(m.from);
            else await zhn.setProfilePicture(m.from, media, "normal");
          }
        }
        break;
      case "setname":
        {
          if (m.isOwner && !m.isGroup) {
            await zhn.updateProfileName(m.isQuoted ? quoted.body : quoted.text);
          } else if (m.isGroup && m.isAdmin && m.isBotAdmin) {
            await zhn.groupUpdateSubject(
              m.from,
              m.isQuoted ? quoted.body : quoted.text
            );
          }
        }
        break;

      /* Umm, maybe for convert menu  */
      case "sticker":
      case "s":
      case "stiker":
        {
          if (/image|video|webp/i.test(quoted.mime)) {
            m.reply("wait");
            const buffer = await quoted.download();
            if (quoted?.msg?.seconds > 10) return m.reply(`Max video 9 second`);
            let exif;
            if (m.text) {
              let [packname, author] = m.text.split("|");
              exif = {
                packName: packname ? packname : "",
                packPublish: author ? author : "",
              };
            } else {
              exif = { ...config.Exif };
            }
            m.reply(buffer, { asSticker: true, ...exif });
          } else if (m.mentions[0]) {
            m.reply("wait");
            let url = await zhn.profilePictureUrl(m.mentions[0], "image");
            m.reply(url, { asSticker: true, ...config.Exif });
          } else if (
            /(https?:\/\/.*\.(?:png|jpg|jpeg|webp|mov|mp4|webm|gif))/i.test(
              m.text
            )
          ) {
            m.reply("wait");
            m.reply(Func.isUrl(m.text)[0], { asSticker: true, ...config.Exif });
          } else {
            m.reply(`Method Not Support`);
          }
        }
        break;
      case "toimg":
      case "toimage":
        {
          let { webp2mp4File } = await import("../lib/sticker.js");
          if (!/webp/i.test(quoted.mime))
            return m.reply(`Reply Sticker with command ${prefix + command}`);
          if (quoted.isAnimated) {
            let media = await webp2mp4File(await quoted.download());
            await m.reply(media);
          }
          let media = await quoted.download();
          await m.reply(media, { mimetype: "image/png" });
        }
        break;

      /* Umm, maybe for group menu  */
      case "hidetag":
      case "ht":
        {
          if (!m.isGroup) return m.reply("group");
          if (!m.isAdmin) return m.reply("admin");
          let mentions = m.metadata.participants.map((a) => a.id);
          let mod = await zhn.cMod(
            m.from,
            quoted,
            /hidetag|tag|ht|h|totag/i.test(quoted.body.toLowerCase())
              ? quoted.body.toLowerCase().replace(prefix + command, "")
              : quoted.body
          );
          zhn.sendMessage(m.from, { forward: mod, mentions });
        }
        break;
      case "add":
      case "+":
        {
          if (!m.isGroup) return m.reply("group");
          if (!m.isAdmin) return m.reply("admin");
          if (!m.isBotAdmin) return m.reply("botAdmin");
          let users =
            m.mentions.length !== 0
              ? m.mentions.slice(0, 2)
              : m.isQuoted
              ? [m.quoted.sender]
              : m.text
                  .split(",")
                  .map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
                  .slice(0, 2);
          if (users.length == 0) return m.reply("Fuck You 🖕");
          await zhn
            .groupParticipantsUpdate(m.from, users, "add")
            .then(async (res) => {
              for (let i of res) {
                if (i.status == 403) {
                  let node = getBinaryNodeChildren(i.content, "add_request");
                  await m.reply(
                    `Can't add @${i.jid.split("@")[0]}, send invitation...`
                  );
                  let url = await zhn
                    .profilePictureUrl(m.from, "image")
                    .catch(
                      (_) =>
                        "https://lh3.googleusercontent.com/proxy/esjjzRYoXlhgNYXqU8Gf_3lu6V-eONTnymkLzdwQ6F6z0MWAqIwIpqgq_lk4caRIZF_0Uqb5U8NWNrJcaeTuCjp7xZlpL48JDx-qzAXSTh00AVVqBoT7MJ0259pik9mnQ1LldFLfHZUGDGY=w1200-h630-p-k-no-nu"
                    );
                  await zhn.sendGroupV4Invite(
                    i.jid,
                    m.from,
                    node[0]?.attrs?.code || node.attrs.code,
                    node[0]?.attrs?.expiration || node.attrs.expiration,
                    m.metadata.subject,
                    url,
                    "Invitation to join my WhatsApp Group"
                  );
                } else if (i.status == 409)
                  return m.reply(
                    `@${i.jid?.split("@")[0]} already in this group`
                  );
                else m.reply(Func.format(i));
              }
            });
        }
        break;
      case "welcome":
        {
          if (!m.isAdmin) return m.reply("admin");
          let db = global.db.groups[m.from];
          if (db.welcome) {
            db.welcome = false;
            m.reply("Succes Deactive Welcome on This Group");
          } else if (!db.welcome) {
            db.welcome = true;
            m.reply("Succes Activated Welcome on This Group");
          }
        }
        break;
      case "leaving":
        {
          if (!m.isAdmin) return m.reply("admin");
          let db = global.db.groups[m.from];
          if (db.leave) {
            db.leave = false;
            m.reply("Succes Deactive Leaving on This Group");
          } else if (!db.leave) {
            db.leave = true;
            m.reply("Succes Activated Leaving on This Group");
          }
        }
        break;
      case "linkgroup":
      case "linkgrup":
      case "linkgc":
        {
          if (!m.isGroup) return m.reply("group");
          if (!m.isAdmin) return m.reply("admin");
          if (!m.isBotAdmin) return m.reply("botAdmin");
          await m.reply(
            "https://chat.whatsapp.com/" + (await zhn.groupInviteCode(m.from))
          );
        }
        break;

      /* Umm, maybe for tool menu  */
      case "fetch":
      case "get":
        {
          if (!/^https:\/\//i.test(m.text))
            return m.reply(
              `No Query?\n\nExample : ${prefix + command} https://api.xfarr.com`
            );
          m.reply("wait");
          let mime = await import("mime-types");
          const res = await axios.get(Func.isUrl(m.text)[0], {
            responseType: "arraybuffer",
          });
          if (
            !/utf-8|json|html|plain/.test(res?.headers?.get("content-type"))
          ) {
            let fileName = /filename/i.test(
              res.headers?.get("content-disposition")
            )
              ? res.headers
                  ?.get("content-disposition")
                  ?.match(/filename=(.*)/)?.[1]
                  ?.replace(/["';]/g, "")
              : "";
            return m.reply(res.data, {
              fileName,
              mimetype: mime.lookup(fileName),
            });
          }
          let text = res?.data?.toString() || res?.data;
          text = format(text);
          try {
            m.reply(text.slice(0, 65536) + "");
          } catch (e) {
            m.reply(format(e));
          }
        }
        break;
      case "ss":
      case "ssweb":
        {
          if (!Func.isUrl(m.text))
            return m.reply(
              `Example : ${prefix + command} https://github.com/DikaArdnt`
            );
          await m.reply("wait");
          if (/phone/i.test(m.text)) {
            let req = await (
              await api("xfarr")
            ).get(
              "/api/tools/ssphone",
              { url: Func.isUrl(m.text)[0] },
              "apikey",
              { responseType: "arraybuffer" }
            );
            if (req?.status && req.status !== 200)
              return m.reply(req?.message || "error");
            await m.reply(req);
          } else if (/tablet/i.test(m.text)) {
            let req = await (
              await api("xfarr")
            ).get(
              "/api/tools/sstablet",
              { url: Func.isUrl(m.text)[0] },
              "apikey",
              { responseType: "arraybuffer" }
            );
            if (req?.status && req.status !== 200)
              return m.reply(req?.message || "error");
            await m.reply(req);
          } else {
            let req = await (
              await api("xfarr")
            ).get(
              "/api/tools/ssdesktop",
              { url: Func.isUrl(m.text)[0] },
              "apikey",
              { responseType: "arraybuffer" }
            );
            if (req?.status && req.status !== 200)
              return m.reply(req?.message || "error");
            await m.reply(req);
          }
        }
        break;
      // view once so easy bro 🤣
      case "rvo":
        {
          if (!quoted.msg.viewOnce)
            return m.reply(`Reply view once with command ${prefix + command}`);
          quoted.msg.viewOnce = false;
          await zhn.sendMessage(m.from, { forward: quoted }, { quoted: m });
        }
        break;
      case "blackbox":
      case "aicode":
        {
          if (!m.text)
            return m.reply(
              `Example : ${
                m.prefix + m.command
              } create code html & css for hack NASA`
            );
          await m.reply("wait");
          let req = await (
            await api("xfarr")
          ).get("/api/ai/blackbox", { chat: m.text }, "apikey");
          if (req.status !== 200) return m.reply(req.message);
          await m.reply(req.result);
        }
        break;
      case "ai":
      case "chatgpt":
      case "openai":
        {
          if (!m.text)
            return m.reply(
              `Example : ${
                m.prefix + m.command
              } create code html & css for hack NASA`
            );
          await m.reply("wait");
          let req = await (
            await api("xfarr")
          ).get("/api/ai/chatgpt", { chat: m.text }, "apikey");
          if (req.status !== 200) return m.reply(req.message);
          await m.reply(req.result);
        }
        break;
      case "diffusion":
      case "diff":
        {
          if (!m.text)
            return m.reply(
              `Example : ${
                m.prefix + m.command
              } beautiful, aesthetic, mountain, river, trees`
            );
          await m.reply("wait");
          let req = await (
            await api("xfarr")
          ).get("/api/ai/stablediff", { prompt: m.text }, "apikey", {
            responseType: "arraybuffer",
          });
          if (req?.status && req.status !== 200)
            return m.reply(req?.message || "error");
          await m.reply(req);
        }
        break;
      case "animediffusion":
      case "animediff":
        {
          if (!m.text)
            return m.reply(
              `Example : ${
                m.prefix + m.command
              } cat, kawai, moe, tatsumaki, one punch man`
            );
          await m.reply("wait");
          let req = await (
            await api("xfarr")
          ).get("/api/ai/animediff", { prompt: m.text }, "apikey", {
            responseType: "arraybuffer",
          });
          if (req?.status && req.status !== 200)
            return m.reply(req?.message || "error");
          await m.reply(req);
        }
        break

      case "tiktok":
      case "tt":
        {
          if (!/https?:\/\/(www\.|v(t|m|vt)\.|t\.)?tiktok\.com/i.test(m.text))
            return m.reply(
              `Example : ${prefix + command} https://vt.tiktok.com/ZSwWCk5o/`
            );
          await m.reply("wait");
          let req = await (
            await api("xfarr")
          ).get(
            "/api/download/tiktoknowm",
            { url: Func.isUrl(m.text)[0] },
            "apikey"
          );
          if (req.status !== 200) return m.reply(req.message);
          if (/music/g.test(req.result.url)) {
            req = await (
              await api("xfarr")
            ).get(
              "/api/download/tiktokslide",
              { url: Func.isUrl(m.text)[0] },
              "apikey"
            );
            if (req.status !== 200) return m.reply(req?.message || "error");
            for (let url of req.result.url) {
              m.reply(url);
              await Func.sleep(5); // delay 5 seconds
            }
          } else
            m.reply(req.result.url, {
              caption: `${req.result.author}\n\n${req.result.description}`,
            });
        }
        break;
      case "instagram":
      case "ig":
      case "igdl":
        {
          if (!/https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)/i.test(m.text))
            return m.reply(
              `Example : ${
                prefix + command
              } https://www.instagram.com/p/CITVsRYnE9h/`
            );
          await m.reply("wait");
          let req = await (
            await api("xfarr")
          ).get(
            "/api/download/instagram",
            { url: Func.isUrl(m.text)[0] },
            "apikey"
          );
          if (req.status !== 200) return m.reply(req?.message || "error");
          for (let url of req.result) {
            m.reply(url, { caption: req?.result?.caption });
          }
        }
        break;
      case "facebook":
      case "fb":
      case "fbdl":
        {
          if (
            !/https?:\/\/(fb\.watch|(www\.|web\.|m\.)?facebook\.com)/i.test(
              m.text
            )
          )
            return m.reply(
              `Example : ${
                prefix + command
              } https://www.facebook.com/watch/?v=2018727118289093`
            );
          await m.reply("wait");
          let req = await (
            await api("xfarr")
          ).get(
            "/api/download/facebook",
            { url: Func.isUrl(m.text)[0] },
            "apikey"
          );
          if (req.status !== 200) return m.reply(req?.message || "error");
          await m.reply(req?.result?.url?.hd || req?.result?.url?.sd, {
            caption: req?.result?.title,
          });
        }
        break;
      case "drive":
      case "gdrive":
        {
          if (!/https:\/\/drive\.google\.com\/file\/d\/(.*?)\//i.test(m.text))
            return m.reply(
              `Example : ${
                prefix + command
              } https://drive.google.com/file/d/0B_WlBmfJ3KOfdlNyVWwzVzQ1QTQ/view?resourcekey=0-P3IayYTmxJ5d8vSlf-CpUA`
            );
          await m.reply("wait");
          let req = await (
            await api("xfarr")
          ).get(
            "/api/download/gdrive",
            { url: Func.isUrl(m.text)[0] },
            "apikey"
          );
          if (req.status !== 200) return m.reply(req?.message || "error");
          await m.reply(req?.result?.url, {
            fileName: req?.result?.name,
            mimetype: req?.result?.mimetype,
          });
        }
        break;
      case "imgur":
        {
          if (!/https:\/\/imgur\.com\/gallery\//i.test(m.text))
            return m.reply(
              `Example : ${prefix + command} https://imgur.com/gallery/ksnRO`
            );
          await m.reply("wait");
          let req = await (
            await api("xfarr")
          ).get(
            "/api/download/imgur",
            { url: Func.isUrl(m.text)[0] },
            "apikey"
          );
          if (req.status !== 200) return m.reply(req?.message || "error");
          await m.reply(req?.result?.video || req?.result?.image);
        }
        break;
      case "mediafire":
        {
          if (
            !/https?:\/\/(www\.)?mediafire\.com\/(file|download)/i.test(m.text)
          )
            return m.reply(
              `Example : ${
                prefix + command
              } https://www.mediafire.com/file/96mscj81p92na3r/images+(35).jpeg/file`
            );
          await m.reply("wait");
          let req = await (
            await api("xfarr")
          ).get(
            "/api/download/mediafire",
            { url: Func.isUrl(m.text)[0] },
            "apikey"
          );
          if (req.status !== 200) return m.reply(req?.message || "error");
          await m.reply(req?.result?.link, {
            fileName: a?.result?.name,
            mimetype: a?.result?.mime,
          });
        }
        break;
      case "pinterest":
        {
          if (!m.text)
            return m.reply(
              `Example :\n\n1. ${prefix + command} zhn\n2. ${
                prefix + command
              } https://id.pinterest.com/pin/936748791217202640`
            );
          await m.reply("wait");
          if (
            /(?:https?:\/\/)?(?:id\.)?(?:pinterest\.com|pin\.it)\/\W*/i.test(
              m.text
            )
          ) {
            let req = await (
              await api("xfarr")
            ).get(
              "/api/download/pinterest",
              { url: Func.isUrl(m.text)[0] },
              "apikey"
            );
            if (req.status !== 200) return m.reply(req?.message || "error");
            await m.reply(req?.result?.[0]?.url);
          } else {
            let req = await (
              await api("xfarr")
            ).get("/api/search/pinterest", { query: m.text }, "apikey");
            if (req.status !== 200) return m.reply(req?.message || "error");
            let res = req.result[Math.floor(Math.random() * req.result.length)];
            await m.reply(res.image, { caption: res.caption });
          }
        }
        break;
      case "twitter":
        {
          if (!/https?:\/\/(www\.)?(twitter|X)\.com\/.*\/status/i.test(m.text))
            return m.reply(
              `Example : ${
                prefix + command
              } https://twitter.com/CJDLuffy/status/1683219386595721216?t=EN1LZTURgFYexHISfC3keg&s=19`
            );
          await m.reply("wait");
          let req = await (
            await api("xfarr")
          ).get(
            "/api/download/twittervideo",
            { url: Func.isUrl(m.text)[0] },
            "apikey"
          );
          if (req.status !== 200) return m.reply(req?.message || "error");
          await m.reply(req?.result?.url[0], { caption: req.result.caption });
        }
        break;
      case "ytv":
        {
          if (
            !/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?(?:music\.)?youtube\.com\/(?:watch|v|embed|shorts))/i.test(
              m.text
            )
          )
            return m.reply(
              `Example : ${prefix + command} https://youtu.be/_EYbfKMTpRs`
            );
          await m.reply("wait");
          let req = await (
            await api("xfarr")
          ).get("/api/download/ytvideo", { url: Func.isUrl(m.text) }, "apikey");
          if (req.status !== 200) return m.reply(req?.message || "error");
          await m.reply(req.result.result[0].download, {
            fileName: req.result.title + ".mp4",
            mimetype: "video/mp4",
          });
        }
        break;
      case "yta":
        {
          if (
            !/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?(?:music\.)?youtube\.com\/(?:watch|v|embed|shorts))/i.test(
              m.text
            )
          )
            return m.reply(
              `Example : ${prefix + command} https://youtu.be/_EYbfKMTpRs`
            );
          await m.reply("wait");
          let req = await (
            await api("xfarr")
          ).get("/api/download/ytaudio", { url: Func.isUrl(m.text) }, "apikey");
          if (req.status !== 200) return m.reply(req?.message || "error");
          await m.reply(req.result.result[0].download, {
            fileName: req.result.title + ".mp3",
            mimetype: "audio/mpeg",
          });
        }
        break;
      case "apk":
      case "apkdl":
        {
          if (!m.text)
            return m.reply(`Example : ${m.prefix + m.command} com.whatsapp`);
          await m.reply("wait");
          let req = await (
            await api("xfarr")
          ).get("/api/download/apk", { package: m.text }, "apikey");
          if (req.status !== 200) return m.reply(req?.message || "error");
          let text = `${req.result.name}\n\n• Package : ${
            req.result.package
          }\n• Size : ${Func.formatSize(req.result.size)}\n• Release : ${
            req.result.added
          }\n• Updated : ${req.result.updated}\n• Version : ${
            req.result.file?.vername
          }\n• CPU Support : ${req.result.file?.hardware?.cpus.join(", ")}`;
          let msg = await m.reply(req.result.media.screenshots[0].url, {
            caption: text,
          });
          let url = req.result.file?.path || req.result.file?.path_alt;
          await zhn.sendMedia(m.from, url, msg, {
            asDocument: true,
            fileName: req.result.name + Func.mime(url).ext,
            mimetype: Func.mime(url).mime,
          });
        }
        break;
      case "spotify":
        {
          if (
            !/(?:https?:\/\/)?(?:open\.)?spotify.com(?:\/[a-zA-Z0-9\-]+)?\/track\//i.test(
              m.text
            )
          )
            return m.reply(
              `Example : ${
                m.prefix + m.command
              } https://open.spotify.com/track/3W4U7TEgILGpq0EmquurtH`
            );
          await m.reply("wait");
          let req = await (
            await api("xfarr")
          ).get(
            `/api/download/spotify`,
            { url: Func.isUrl(m.text)[0] },
            "apikey",
            { responseType: "arraybuffer" }
          );
          if (req?.status && req.status !== 200)
            return m.reply(req?.message || "error");
          await m.reply(req);
        }
        break;

      /* Umm, maybe for education menu */
      case "wiki":
      case "wikipedia":
        {
          if (!m.text) return m.reply(`Example : ${prefix + command} Jokowi`);
          await m.reply("wait");
          let req = await (
            await api("xfarr")
          ).get("/api/education/wikipedia", { query: m.text }, "apikey");
          if (req.status !== 200) return m.reply(req?.message || "error");
          await m.reply(req.result?.[0]?.thumb, {
            caption: req.result?.[0]?.wiki,
          });
        }
        break;

      /* Umm, maybe for search menu */
      case "chord":
        {
          if (!m.text)
            return m.reply(`Example : ${prefix + command} black rover`);
          await m.reply("wait");
          let req = await (
            await api("xfarr")
          ).get("/api/search/chord", { query: m.text }, "apikey");
          if (req.status !== 200) return m.reply(req?.message || "error");
          await m.reply(`${req.result.title}\n\n${req.result.chord}`);
        }
        break;
      case "lirik":
      case "lyric":
        {
          if (!m.text)
            return m.reply(`Example : ${prefix + command} black rover`);
          await m.reply("wait");
          let req = await (
            await api("xfarr")
          ).get("/api/search/lirik", { query: m.text }, "apikey");
          if (req.status !== 200) return m.reply(req?.message || "error");
          await m.reply(`${req.result.song}\n\n${req.result.lirik}`);
        }
        break;

      /* Umm, maybe for islami menu */
      case "quran":
        {
          if (!Number(m.text)) {
            let text = `Example : ${
              prefix + command
            } 1\n\n#note\n1 = Al-Fatihah\n\n`;
            let a = await (
              await api("xfarr")
            ).get("/api/islami/listsurah", {}, "apikey");
            if (a.status == 200)
              text += a.result
                .map((r) => `*${r.nomor}.* ${r.nama} (${r.nama_latin}))`)
                .join("------\n\n");
            return m.reply(text);
          }
          await m.reply("wait");
          let a = await (
            await api("xfarr")
          ).get("/api/islami/surah", { nomor: Number(m.text) }, "apikey");
          let b = await (
            await api("xfarr")
          ).get("/api/islami/ayat", { nomor: Number(m.text) }, "apikey");
          if (a.status !== 200) return m.reply("error");
          let text = `
${a.result.nama} (${a.result.arti})

*Ayat :* ${a.result.jumlah_ayat}
*Turun :* ${a.result.tempat_turun}

${a.result.deskripsi}

${b.result
  .map((r) => `*${r.nomor}.*\n${r.arab}\n\n${r.latin}\n${r.indonesia}`)
  .join("-------\n\n")}
                `;
          let msg = await m.reply(text);
          await zhn.sendMedia(
            m.from,
            `${config.APIs.xfarr.baseURL}/api/islami/surahaudio?apikey=${
              config.APIs.xfarr.Key
            }&nomor=${Number(m.text)}`,
            msg,
            { mimetype: "audio/mpeg" }
          );
        }
        break;
      case "nabi":
      case "kisahnabi":
        {
          if (!m.text) return m.reply(`Example : ${prefix + command} muhammad`);
          await m.reply("wait");
          let req = await (
            await api("xfarr")
          ).get(
            "/api/islami/kisahnabi",
            { nabi: m.text.toLowerCase() },
            "apikey"
          );
          if (req.status !== 200) return m.reply(req?.message || "error");
          if (req.result.length == 0) return m.reply("notFound");
          req = req.result[Math.floor(Math.random() * req.result.length)];
          await m.reply(req?.image_url, {
            caption: `${req.nabi} (${req.thn_kelahiran})\n\n${req.description}`,
          });
        }
        break;

      /* Umm, maybe for textpro command */
      case "1977":
      case "abstrgold":
      case "advancedglow":
      case "americanflag":
      case "arcanetvseries":
      case "artpapercut":
      case "bagel":
      case "beach":
      case "berry":
      case "biscuit":
      case "blackandwhitebearmascot":
      case "blackpink":
      case "blackpink":
      case "blackpinkdecoratedwithroses":
      case "bloodfrostedglass":
      case "bluecircuit":
      case "bluefoilballoon":
      case "blueglass":
      case "bluesparklingjewelry":
      case "bokeh":
      case "box":
      case "bread":
      case "breakwall":
      case "brokenglass":
      case "businesssign":
      case "captainamerica":
      case "carvedstone":
      case "chocolatecake":
      case "chrismastgift":
      case "christmasbyname":
      case "christmascandycane":
      case "christmasholidaysnow":
      case "christmastree":
      case "cloud":
      case "cloudsky":
      case "colorfullluxurymetal":
      case "colorleddisplayscreen":
      case "countryflaggenerator":
      case "creatglossymetalic":
      case "creativegolden":
      case "cyanfoilballoon":
      case "cyanglass":
      case "cyanjewelry":
      case "cyansparklingjewelry":
      case "decorategreen":
      case "decoratepurple":
      case "decorativeglass":
      case "deepsemetal":
      case "deluxegold":
      case "deluxesilver":
      case "denim":
      case "doubleexposureblackwhite":
      case "dropwater":
      case "elegantwhitegold":
      case "embossedoncrackedsurface":
      case "fabric":
      case "fireworksparkle":
      case "foilballoonbirthday":
      case "fruitjuice":
      case "fullcolorballoon":
      case "futuristictechnologyneonlight":
      case "giraffe":
      case "glass":
      case "glossybluemetal":
      case "glossycarbon":
      case "glossymetal":
      case "glowingneonlight":
      case "glue":
      case "goldenancient":
      case "goldenonredsparkles":
      case "goldfoilballoon":
      case "goldsparklingjewelry":
      case "gradient":
      case "gradientgenerator":
      case "gradientneonlight":
      case "graffitiwall":
      case "greenfoilballoon":
      case "greenglass":
      case "greenhorror":
      case "greenjewelry":
      case "greenneon":
      case "greensparklingjewelry":
      case "halloweenfire":
      case "halloweenskeleton":
      case "happnewyearcardfireworkgif":
      case "happynewyeargreetingcard":
      case "harrypotter":
      case "holographic":
      case "honey":
      case "horrorblood":
      case "horrorgift":
      case "icecold":
      case "impressiveglitch":
      case "joker":
      case "koifish":
      case "lava":
      case "lightglowsliced":
      case "luxurygold":
      case "luxurymetallic":
      case "magmhot":
      case "makebatman":
      case "marble":
      case "marbleslabs":
      case "matrix":
      case "metaldarkgold":
      case "metaldarkgold":
      case "metallic":
      case "metalpurpledual":
      case "metalrainbow":
      case "minion":
      case "multicolorpapercut":
      case "naturalleaves":
      case "neon":
      case "neon":
      case "neondevilwings":
      case "neonlight":
      case "neonlight":
      case "neonlightblackpink":
      case "neonlightglitchgenerator":
      case "neonlightonbrickwall":
      case "neonlightwithgalaxy":
      case "newyearcardsbyname":
      case "orangeglass":
      case "orangejewelry":
      case "orangejuice":
      case "peridotstone":
      case "pinkfoilballoon":
      case "pinksparklingjewelry":
      case "plasticbagdrug":
      case "pottery":
      case "purplefoilballoon":
      case "purplegem":
      case "purpleglass":
      case "purpleglass":
      case "purplejewelry":
      case "purpleshinyglass":
      case "purplesparklingjewelry":
      case "quicksparklingdiamonds":
      case "rainbowcolorcalligraphy":
      case "rainbowequalizer":
      case "redfoilballoon":
      case "redglass":
      case "redjewelry":
      case "redsparklingjewelry":
      case "roadwarning":
      case "robotr2d2":
      case "rock":
      case "rustedmetal":
      case "rustymetal":
      case "sandengraved":
      case "sandwriting":
      case "sciencefiction":
      case "scifi":
      case "scifi":
      case "shinymetal":
      case "silverjewelry":
      case "skeleton":
      case "sketch":
      case "snowwinterholidays":
      case "space":
      case "sparklesmerrychristmas":
      case "steel":
      case "stone":
      case "stonecracked":
      case "strawberry":
      case "summerneonlight":
      case "summerwithpalmtree":
      case "summerysandwriting":
      case "thunder":
      case "thundergenerator":
      case "toxic":
      case "transmer":
      case "typography":
      case "ultragloss":
      case "underwatergenerator":
      case "watercolor":
      case "waterpipe":
      case "wicker":
      case "wonderfulgraffitiart":
      case "wood":
      case "writeinsandsummerbeach":
      case "writeonfoggywindow":
      case "xmascards":
      case "yellowglass":
      case "yellowjewelry":
        {
          if (!m.text)
            return m.reply(`Example : ${prefix + command} Dika Ardnt.`);
          await m.reply("wait");
          let req = await (
            await api("xfarr")
          ).get(`/api/textpro/${command}`, { text: m.text }, "apikey", {
            responseType: "arraybuffer",
          });
          if (req?.status && req.status !== 200)
            return m.reply(req?.message || "error");
          await m.reply(req);
        }
        break;
      case "avengers":
      case "captainameric":
      case "cinematichorror":
      case "glitch":
      case "glitchtiktok":
      case "layered":
      case "lionmascot":
      case "marvelstudios":
      case "marvelstudiosvermetal":
      case "metal":
      case "metalgalaxy":
      case "metalgold":
      case "metalrosegold":
      case "metalsilver":
      case "ninja":
      case "pornhubgenerator":
      case "retro":
      case "space":
      case "spookyhalloween":
      case "steel":
      case "stone":
      case "thor":
      case "videogameclassicbit":
      case "vintagelightbulb":
      case "wallgraffiti":
      case "wolfblackwhite":
      case "wolfgalaxy":
        {
          let [text1, text2] = m.text.split("|");
          if (!text2) return m.reply(`Example ${prefix + command} Dika|Ardnt.`);
          await m.reply("wait");
          let req = await (
            await api("xfarr")
          ).get(`/api/textpro/${command}`, { text1, text2 }, "apikey", {
            responseType: "arraybuffer",
          });
          if (req?.status && req.status !== 200)
            return m.reply(req?.message || "error");
          await m.reply(req);
        }
        break;

      /* Umm, maybe for ephoto command */
      case "1917":
      case "3dhologram":
      case "3dtexteffect":
      case "3dtextstyle":
      case "3dcrack":
      case "3dcubictext":
      case "3dgradient":
      case "3dgradient2":
      case "3dsand":
      case "3dshinymetallic":
      case "3dwoodenlogo":
      case "3dwoodentext":
      case "3dchristmas":
      case "3dbeach":
      case "3dpapercut":
      case "3dunderwater":
      case "aovwallpaper2":
      case "aovwallpaper3":
      case "aovwallpaper4":
      case "aovwallpapers":
      case "advancedglow":
      case "americanflag":
      case "amongus":
      case "angelwing":
      case "announcementofwinning":
      case "aovarena":
      case "aovbanner":
      case "avatar3q360":
      case "avatardota":
      case "avatarlol":
      case "avatarlol2":
      case "blackpink":
      case "balloontext":
      case "bannerlol":
      case "battlefield":
      case "beautifulgold":
      case "birthdaycake":
      case "birthdaycake2":
      case "birthdaycake3":
      case "birthdaycake3":
      case "birthdaycake4":
      case "blackpinklogo":
      case "blackpinkneon":
      case "bloodtext":
      case "bloodwritingtext":
      case "bokehtext":
      case "borderproject":
      case "csgo":
      case "csgocover":
      case "caketext2":
      case "caketext":
      case "candytext":
      case "capercut":
      case "cardshalloween":
      case "chocolate":
      case "christmasball":
      case "christmasnewyear2":
      case "christmaseffect":
      case "christmasnewyear":
      case "christmasseason":
      case "christmassnow":
      case "christmasvideo":
      case "chrometext":
      case "cloudtext":
      case "coffee":
      case "colortext":
      case "colorfulglowing":
      case "colorfultext":
      case "covergraffiti":
      case "createwater":
      case "createtext":
      case "crossfire":
      case "crossfirecover":
      case "cyberhunter":
      case "dance":
      case "darkgreentypography":
      case "diamondtext":
      case "dota2cover":
      case "doubleexposure":
      case "dragonball":
      case "dragonsteel":
      case "embroider":
      case "fabrictext":
      case "firetext":
      case "firework":
      case "firework":
      case "flamelettering":
      case "foggyrainy":
      case "freefire":
      case "freefireavatar":
      case "freefirefb":
      case "funnyminion":
      case "galaxy":
      case "galaxytext":
      case "gemstone":
      case "generalexamcrank":
      case "glittergold":
      case "glossychrome":
      case "goldbutton":
      case "goldpurple":
      case "goldtext":
      case "goldtext2":
      case "goldtextgenerators":
      case "goldtext3":
      case "graffititext":
      case "graffititext5":
      case "graffiticolor":
      case "graffitilettering":
      case "greenbrush":
      case "greenneon":
      case "halloween":
      case "halloweenbatstext":
      case "halloweenfire":
      case "halloweenvideo":
      case "heart":
      case "heartcup":
      case "hollywoodwalk":
      case "horrorcemeterygate":
      case "icetext":
      case "joker":
      case "jeanfabric":
      case "jewel":
      case "lok(aov)":
      case "lolpentakill":
      case "leagueofangels":
      case "leagueofking":
      case "leagueofkings":
      case "ligaturesfromleaves":
      case "lighteffects":
      case "lol":
      case "logoastronaut":
      case "lolavatar":
      case "lolbanner":
      case "lolcover":
      case "lolfb":
      case "lolwp":
      case "lolwp2":
      case "lovecard":
      case "luxurylogo":
      case "magictext":
      case "matrixtext":
      case "merrychristmas":
      case "metal":
      case "metalavatar":
      case "metalmascots":
      case "metalblue":
      case "metallogo":
      case "metalstartext":
      case "metaltext":
      case "metallic":
      case "milkcaketext":
      case "minimallogo":
      case "mobilelegendswallpaper":
      case "moderngold":
      case "moderngoldred":
      case "moderngoldsilver":
      case "moderngold3":
      case "moderngold4":
      case "moderngold5":
      case "musicequalizer":
      case "nationalflag":
      case "neonlight":
      case "neontext":
      case "neontext3":
      case "neontextlight":
      case "neondevilwings":
      case "newyear":
      case "nigeriaflag":
      case "noel":
      case "onepiece":
      case "overwatchcover":
      case "overwatchwallpaper":
      case "overwatchhero":
      case "pubgbirthday":
      case "pubglogo2":
      case "pubglogo3":
      case "pubgchar":
      case "pubgcover":
      case "pubgfb":
      case "pubgglitch":
      case "pubglogo":
      case "pubgteam":
      case "paintsplatter":
      case "party":
      case "plasmatexteffects":
      case "purpletext":
      case "retrotext":
      case "roadpaint":
      case "royaltext":
      case "santaclaus":
      case "shadowtext":
      case "snake":
      case "snowontext":
      case "starwars":
      case "starsnight":
      case "starsnight2":
      case "summerbeach2":
      case "sunlightshadow":
      case "teamlogo":
      case "teamfighttactics":
      case "textgalaxy":
      case "textgraffiti3d":
      case "texthalloween":
      case "texthalloween2":
      case "textheartflashlight":
      case "textlight":
      case "textcake":
      case "textchristmas":
      case "textmetal":
      case "textoncloth":
      case "thundertext":
      case "typography":
      case "underwatertext":
      case "valentinesday":
      case "warface":
      case "water3dtext":
      case "watertext":
      case "wingsgalaxy":
      case "wingstext":
      case "wooden3d":
      case "writegalaxy":
      case "writegalaxy2":
      case "writegoldletters":
      case "writingblackboard":
      case "yasuologo":
      case "zodiac":
      case "zombie3d":
      case "angelwings":
      case "animationsbear":
      case "anonymoushacker":
      case "avataraov":
      case "avatarrov":
      case "avatargold":
      case "balloon":
      case "bear":
      case "birthdaycake3":
      case "birthdaycards":
      case "birthdayfoilballoon":
      case "brokenglass":
      case "cakes":
      case "cartoongraffiti":
      case "chalkontheblackboard":
      case "chocolate2":
      case "cloudsinthesky":
      case "colorfulangel":
      case "covercf":
      case "coverlol":
      case "deleting":
      case "digitalglitch":
      case "digitaltiger":
      case "facebook":
      case "foggyglass":
      case "football":
      case "galaxylogo":
      case "gaminglogo":
      case "gaminglogofps":
      case "girlgamer":
      case "glass":
      case "glowingtext":
      case "goldletters":
      case "graffitiletters":
      case "happywomensday":
      case "horrorletters":
      case "horrortext":
      case "impressiveleaves":
      case "inthesky":
      case "incandescentbulbs":
      case "leafautumn":
      case "lettersontheleaves":
      case "lightgalaxy":
      case "lightsignatures":
      case "logointro":
      case "logoteam":
      case "lolavatar2":
      case "luxurygold":
      case "mascotlogo":
      case "maskotteamlogo":
      case "mechanical":
      case "metalborder":
      case "metalliceffect":
      case "namesonthesand":
      case "nature":
      case "neonglitch":
      case "neonblue":
      case "neonlogo":
      case "newyearvideo":
      case "papercut":
      case "pavement":
      case "personalizedqueen":
      case "pig":
      case "pixelglitch":
      case "puppycute":
      case "realisticcloud":
      case "realisticembroidery":
      case "rotationlogo":
      case "ruby​​stone":
      case "signatureattachment":
      case "silvertext":
      case "snow3d":
      case "summerbeach":
      case "summerysand":
      case "sweetlove":
      case "tattoosignature":
      case "tattoos":
      case "technology":
      case "texteffectsnight":
      case "tmaker":
      case "vibrantfireworks":
      case "vintagetelevision":
      case "wallpapermobile":
      case "warningsign":
      case "watercolor":
      case "womensday":
      case "wordgreenflares":
      case "wordgreenlight":
      case "zodiacwallpaper":
        {
          if (!m.text)
            return m.reply(`Example : ${prefix + command} Dika Ardnt.`);
          await m.reply("wait");
          let req = await (
            await api("xfarr")
          ).get(`/api/ephoto360/${command}`, { text: m.text }, "apikey", {
            responseType: "arraybuffer",
          });
          if (req?.status && req.status !== 200)
            return m.reply(req?.message || "error");
          await m.reply(req);
        }
        break;
      case "3dstone":
      case "3dlightbulb":
      case "3dwood":
      case "amongusbanner":
      case "apexlegend":
      case "barcashirt":
      case "callofduty":
      case "captainamerica":
      case "companylogo":
      case "companylogo2":
      case "floralluxury":
      case "footballlogo":
      case "glitter":
      case "juventusshirt":
      case "latestspace3d":
      case "letters":
      case "logo3dmetal":
      case "lolytbanner":
      case "lovelyfloral":
      case "marvels":
      case "metalliccover":
      case "neontext2":
      case "overwatchavatar":
      case "overwatchytbanner":
      case "pubglogo":
      case "pubgytbanner":
      case "polygonlogo":
      case "pornhub":
      case "premierleaguecup":
      case "quotesimages":
      case "shirtrealmadrid":
      case "steeltext":
      case "tiktok":
      case "writestatus":
      case "balloonslove":
      case "banneraov":
      case "blackandwhite":
      case "classlogo":
      case "footballshirtmessi":
      case "girlgraffiti":
      case "gradientlogo":
      case "graffitithewall":
      case "impressiveanime":
      case "letterlogos":
      case "logoavengers":
      case "logowolf":
      case "logoaccording":
      case "logogaming":
      case "logomascot":
      case "loveballoons":
      case "metallicglass":
      case "pencilsketch":
      case "shirtfootball":
      case "steellettering":
        {
          let [text1, text2] = m.text.split("|");
          if (!text2) return m.reply(`Example ${prefix + command} Dika|Ardnt.`);
          await m.reply("wait");
          let req = await (
            await api("xfarr")
          ).get(`/api/textpro/${command}`, { text1, text2 }, "apikey", {
            responseType: "arraybuffer",
          });
          if (req?.status && req.status !== 200)
            return m.reply(req?.message || "error");
          await m.reply(req);
        }
        break;

      /* Umm, maybe for photooxy command */
      case "3dglowing":
      case "3dnature":
      case "3drainbow":
      case "3dsummer":
      case "3dwoodblack":
      case "between":
      case "birthdaycake":
      case "blackpink":
      case "burnpaper":
      case "butterfly":
      case "candy":
      case "carvedwood":
      case "coffeecup":
      case "coffeecup2":
      case "crisp":
      case "crossfire":
      case "csgo":
      case "cup":
      case "cupsmile":
      case "fabric":
      case "flaming":
      case "flowerheart":
      case "flowertypography":
      case "fur":
      case "glowrainbow":
      case "gradient":
      case "graffiti":
      case "greenleaves":
      case "harrypotter":
      case "hellokitty":
      case "leaves":
      case "lovepicture":
      case "lovetext":
      case "luxury":
      case "metallicglow":
      case "modernmetal":
      case "multimaterial":
      case "naruto":
      case "naturetypography":
      case "neondarkmetal":
      case "neonglow":
      case "neonmetallic":
      case "nightsky":
      case "partyneon":
      case "poly":
      case "raindrops":
      case "rainbowshine":
      case "romanticlove":
      case "scary":
      case "shadowtext":
      case "silk":
      case "skriking3d":
      case "smoke":
      case "smoketypography":
      case "sweetcandy":
      case "underfall":
      case "underflower":
      case "undergrass":
      case "undermatrix":
      case "underwhite":
      case "underwater":
      case "vintage":
      case "warface":
      case "watermelon":
      case "whitestone":
      case "wolfmetal":
      case "woodheart":
      case "woodenboards":
      case "yellowroses":
        {
          if (!m.text)
            return m.reply(`Example : ${prefix + command} Dika Ardnt.`);
          await m.reply("wait");
          let req = await (
            await api("xfarr")
          ).get(`/api/photooxy/${command}`, { text: m.text }, "apikey", {
            responseType: "arraybuffer",
          });
          if (req?.status && req.status !== 200)
            return m.reply(req?.message || "error");
          await m.reply(req);
        }
        break;
      case "arcade8-bit":
      case "battlefield4rising":
      case "glitchtiktok":
      case "pubg":
      case "google":
        {
          let [text1, text2] = m.text.split("|");
          if (!text2) return m.reply(`Example ${prefix + command} Dika|Ardnt.`);
          await m.reply("wait");
          let req = await (
            await api("xfarr")
          ).get(`/api/photooxy/${command}`, { text1, text2 }, "apikey", {
            responseType: "arraybuffer",
          });
          if (req?.status && req.status !== 200)
            return m.reply(req?.message || "error");
          await m.reply(req);
        }
        break;

      /* Umm, maybe for non command */
      default:
        // ini eval ya dek
        if (
          [">", "eval", "=>"].some((a) => m.body?.toLowerCase()?.startsWith(a))
        ) {
          if (!m.isOwner) return m.reply("owner");
          let evalCmd = "";
          try {
            evalCmd = /await/i.test(m.text)
              ? eval("(async() => { " + m.text + " })()")
              : eval(m.text);
          } catch (e) {
            evalCmd = e;
          }
          new Promise(async (resolve, reject) => {
            try {
              resolve(evalCmd);
            } catch (err) {
              reject(err);
            }
          })
            ?.then((res) => m.reply(format(res)))
            ?.catch((err) => m.reply(format(err)));
        }

        // nah ini baru exec dek
        if (["$", "exec"].some((a) => m.body?.toLowerCase()?.startsWith(a))) {
          if (!m.isOwner) return m.reply("owner");
          try {
            exec(m.text, async (err, stdout) => {
              if (err) return m.reply(Func.format(err));
              if (stdout) return m.reply(Func.format(stdout));
            });
          } catch (e) {
            m.reply(Func.format(e));
          }
        }

        // cek bot active or no
        if (/^bot/i.test(m.body)) {
          m.reply(`Bot Activated "${m.pushName}"`);
        }
    }
  } catch (e) {
    m.reply(format(e));
  }
}
