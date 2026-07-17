import { db } from "./index";
import { manifestasiIwa, manifestasiBreakdowns } from "./schema";
import { eq } from "drizzle-orm";

type BreakdownInput = {
  label: string | null;
  keterangan: string;
  dalil: string;
  contoh: string;
};

type ManifestasiInput = {
  poin: string;
  breakdowns: BreakdownInput[];
};

const DATA: ManifestasiInput[] = [
  {
    poin: "Menghargai nilai bumi & memakmurkannya sesuai arahan Allah",
    breakdowns: [
      {
        label: "A. Bumi sebagai tempat Iwa' & ketenangan",
        keterangan:
          "Iwa' adalah hak setiap manusia tanpa memandang warna kulit, suku, atau agama. Bumi diciptakan sebagai hamparan (firasy) & buaian (mahd) yang menopang kenyamanan raga-jiwa. Ditegakkan oleh 3 nilai utama: keadilan, tawadhu', moderat (tawassuth); dirusak oleh 3 kemungkaran: kezaliman, kesombongan, israf.",
        dalil:
          "QS ar-Rahman: 10; Hud: 61; al-Baqarah: 22; az-Zukhruf: 10; adz-Dzariyat: 48. Nilai: al-Hadid: 25 (keadilan), al-Furqan: 63 (tawadhu'), al-A'raf: 31 (moderat). Kemungkaran: al-Qashash: 4 & 83; al-Isra': 37; Luqman: 18; al-Anfal: 73.",
        contoh:
          "Tata ruang berkeadilan; pelestarian lingkungan sebagai lawan israf; penolakan atas kesenjangan sosial yang memicu ketidaknyamanan hidup.",
      },
      {
        label: "B. Bumi sebagai sumber pencaharian & makanan",
        keterangan:
          "Dua kaidah: (1) kebebasan menetap untuk beribadah; (2) kebebasan bekerja/berdagang (adh-dharb fi al-ardh). Rezeki bumi terbuka untuk semua-bahkan non-muslim. Dua jalan pengelolaan: manhaj Allah (halal-thayyib) vs manhaj setan (haram-khabits). Wajib menyingkirkan penghalang seperti monopoli & penyewaan tanah oleh yang tak mengelola.",
        dalil:
          "QS al-'Ankabut: 56; al-Mulk: 15; al-Baqarah: 126, 168, 267; al-Isra': 20; Yunus: 59. Hadis: 'tidak ada di luar halal-thayyib selain haram-khabits' (Bukhari); hadis menanam pohon (Bukhari/Ahmad); 'siapa punya tanah tanamilah atau serahkan' & larangan sewa tanah (Muslim).",
        contoh:
          "Reforma agraria; larangan spekulasi/penelantaran tanah; ekonomi halal & rantai pangan sehat; kritik atas konversi tanah jadi komoditas super mahal.",
      },
      {
        label: "C. Hak bersama atas sumber daya umum & larangan monopoli",
        keterangan:
          "Kekayaan pada dasarnya milik Allah; umat hanya pengelola (mustakhlaf). Harta harus beredar merata, tidak hanya di kalangan kaya. Kanz (menimbun) diancam keras. Sumber daya vital (air, rumput, api) adalah milik bersama-hukumnya menyesuaikan zaman.",
        dalil:
          "QS al-Hasyr: 7; al-Baqarah: 188; at-Taubah: 34. Hadis al-Asy'ariyyun (Bukhari-Muslim); 'Muslim berkongsi dalam tiga: air, rumput, api' (Ahmad); ucapan Umar ttg fudhul harta orang kaya.",
        contoh:
          "Zakat produktif & redistribusi; pengelolaan air/energi/hutan sebagai milik publik; kritik atas kapitalisme monopolistik & oligopoli.",
      },
      {
        label: "D. Bumi sebagai sumber pengetahuan yang menghantarkan ke Allah",
        keterangan:
          "Tujuan tertinggi: bumi sebagai laboratorium afaq (alam) & anfus (diri) untuk menyaksikan tanda kekuasaan Allah. Ilmu tanpa bimbingan wahyu menyesatkan (kritik atas Darwin & peradaban modern yang berhenti pada capaian materialistis).",
        dalil:
          "QS al-Jatsiyah: 3; adz-Dzariyat: 20; al-'Ankabut: 20; Fathir: 41; az-Zumar: 5; al-Baqarah: 164; ar-Rum: 9; Ghafir: 82-83; al-Hajj: 46; Aal 'Imran: 191.",
        contoh:
          "Integrasi sains dengan nilai spiritual; riset yang tak lepas dari etika & keimanan; kritik atas materialisme & saintisme buta.",
      },
    ],
  },
  {
    poin: "Menghargai nilai kerja (keterampilan tangan) & melatih Muslim terampil",
    breakdowns: [
      {
        label: null,
        keterangan:
          "Menumbuhkan cinta kerja-terutama kerja tangan (al-'amal al-yadawi)-sebagai penghidupan terhormat; membenci kemalasan & ketidakberdayaan. Meluruskan makna zuhud: bukan memilih miskin, tetapi mengumpulkan harta halal lalu menyalurkannya untuk kemaslahatan.",
        dalil:
          "Hadis: 'Allah mengecam ketidakberdayaan' (Thabrani); 'sebaik-baik pendapatan adalah hasil kerja tangan' & 'Allah menyukai mukmin yang al-muhtarif' (Baihaqi); kisah Anas (laki-laki & kapak, Baihaqi); ucapan Umar (mutawakkilun vs muttakilun); nasihat Mu'adz bin Jabal & Ali bin 'Attam.",
        contoh:
          "Pendidikan vokasi & kewirausahaan; etos kerja produktif melawan mental 'menunggu bantuan'; kritik atas kurikulum yang lahirkan sarjana tanpa keterampilan aplikatif & birokrasi gemuk tak produktif.",
      },
    ],
  },
  {
    poin: "Meningkatkan kenyamanan, keluarga & sarana hidup; jadikan milik bersama bila perlu",
    breakdowns: [
      {
        label: null,
        keterangan:
          "Sarana penunjang (rumah, kendaraan, komunikasi) bisa diposisikan sebagai al-milkiyyah al-'ammah saat dibutuhkan. Kelebihan (fadhl) tunggangan/bekal wajib dibagi. Pembangunan properti dibatasi tujuan Iwa': terpuji bila menaungi yang butuh, tercela bila untuk gengsi & pemisahan kelas.",
        dalil:
          "Hadis Abu Sa'id al-Khudri (fadhl zhahr & fadhl zad, Muslim); 'unta & rumah milik setan' (Abu Daud); hadis membangun masjid (Bukhari-Muslim); QS asy-Syu'ara: 128-131; hadis Tirmidzi & Khabbab (Muslim); tanda kiamat 'penggembala berlomba bangunan tinggi' (Bukhari-Muslim).",
        contoh:
          "Program rumah subsidi & transportasi publik; kritik atas monopoli properti (rumah kosong vs tunawisma); pemerataan akses komunikasi/internet; kritik pembangunan mewah demi prestise.",
      },
    ],
  },
  {
    poin: "Kesakralan hak menetap; larangan mengusir/mengucilkan dari tempat Iwa'-nya",
    breakdowns: [
      {
        label: null,
        keterangan:
          "Mengusir manusia dari rumah/tanahnya karena perbedaan pendapat/kelompok/kepentingan disamakan dengan 'mengusir & membunuh diri sendiri', karena umat itu satu tubuh. Bahaya terbesar: mengusir pembawa perbaikan (rasul, ulama, cendekiawan)-sunnatullah menetapkan azab bagi pelakunya.",
        dalil:
          "QS al-Baqarah: 84-85; al-Isra': 76-77. Penafsiran ath-Thabari (umat sebagai satu jasad); riwayat Ibn Abbas (pengusiran Nabi -> azab Perang Badar).",
        contoh:
          "Penolakan penggusuran paksa & pengungsian akibat konflik; isu hak atas tempat tinggal & refugee; perlindungan tokoh reformis dari pembungkaman/pengasingan.",
      },
    ],
  },
  {
    poin: "Korelasi keamanan hidup (ekonomi-sosial) dengan keamanan beragama",
    breakdowns: [
      {
        label: null,
        keterangan:
          "Ketahanan ekonomi-sosial = sarana; keamanan beragama = tujuan. Jika sarana rusak, tujuan sulit tercapai. Shalat & zakat tak terpisahkan (dimensi ritual + sosial). Umat bertanggung jawab menyediakan ma'wa bagi pelaku penyimpangan agar akar masalahnya terobati.",
        dalil:
          "QS Ibrahim: 37; at-Taubah: 11. Hadis Abu Waqid al-Laitsi (Ahmad); ucapan Ibn Zaid & Ibn Mas'ud ('shalat sia-sia tanpa zakat'); hadis sedekah pada pencuri/pezina/orang kaya (Bukhari).",
        contoh:
          "Jaring pengaman sosial (bansos, zakat produktif, jaminan kebutuhan pokok); pendekatan atasi kejahatan lewat pemenuhan kebutuhan dasar; kesadaran bahwa kemiskinan ekstrem membuka pintu hilangnya agama.",
      },
    ],
  },
  {
    poin: "Korelasi Iwa' dengan efektivitas politik & tata kelola pemerintahan",
    breakdowns: [
      {
        label: null,
        keterangan:
          "Iwa' butuh sarana politik & tata kelola yang menjamin ketahanannya. Di masa awal Islam ia nyaris bergantung pada ketakwaan & ilmu pribadi penguasa-sesuatu yang rapuh karena hanya dimiliki segelintir orang. Karena itu Iwa' pencaharian & sosial tak boleh bergantung pada preferensi pemimpin, melainkan dilindungi lembaga yang membatasi, mengawasi, dan mengadili wewenang pemerintah, serta legislasi jaminan sosial yang menjaga kehormatan rakyat.",
        dalil:
          "Prinsip Umar: maal Allah/maal al-ummah diperlakukan seperti harta anak yatim (riwayat ath-Thabari 4/255 & 4/258); surat Umar kepada Abu Musa al-Asy'ari ('pejabat menyimpang -> rakyat menyimpang'); Umar menolak rumah pribadi di Mesir lalu menjadikannya pasar wakaf; ucapan Ali bin Abu Thalib (kewajiban pada harta orang kaya untuk mencukupi fakir); QS at-Taubah: 31 (bahaya ulama sultan).",
        contoh:
          "Lembaga antikorupsi, audit & pengawasan kekuasaan; akuntabilitas & interpelasi pejabat; transparansi keuangan negara; legislasi jaminan sosial (bukan mengandalkan kedermawanan penguasa); kritik atas 'ulama al-muluk wa ar-ru'asa' yang melegitimasi kezaliman.",
      },
    ],
  },
  {
    poin: "Integrasi negeri-negeri Muslim: kesatuan (al-wahdah) atau persatuan (al-ittihad)",
    breakdowns: [
      {
        label: null,
        keterangan:
          "Tanpa integrasi, Iwa' & kebangkitan peradaban mustahil, sebab peradaban hanya berdiri di atas hamparan tanah yang luas. Fanatisme ('ashabiyah) kesukuan/ras/kelompok yang memecah dunia Islam menghentikan penyebaran peradaban hingga jumud & runtuh. Negara Islam modern yang justru menguatkan fragmentasi (UU perjalanan, tinggal, kerja) terperangkap kelemahan politik, utang, & kekacauan meski kaya SDM dan SDA.",
        dalil:
          "Hadis: 'Bukan golongan kami orang yang kenyang di malam hari sementara tetangganya kelaparan padahal ia tahu' (Musnad Ahmad)-prinsip kesatuan ekonomi & sumber daya sebagai ciri umat.",
        contoh:
          "Blok/integrasi regional yang menyediakan beragam 'Iwa'' (pemikiran, ekonomi, pencaharian, keamanan) dan menarik talenta-analog Amerika, Eropa, China, Jepang; pasar & mata uang bersama; kritik atas fragmentasi negara Arab/Islam (juga Afrika & Amerika Latin) yang memicu brain drain, arus pengungsi, & kekayaan alam terangkut keluar.",
      },
    ],
  },
];

async function seedManifestasi() {
  console.log("Seeding Manifestasi Iwa'...");

  for (const item of DATA) {
    let [row] = await db
      .select()
      .from(manifestasiIwa)
      .where(eq(manifestasiIwa.poin, item.poin))
      .limit(1);

    if (!row) {
      [row] = await db
        .insert(manifestasiIwa)
        .values({ poin: item.poin })
        .returning();
      console.log(`Inserted manifestasi: ${item.poin}`);
    } else {
      console.log(`Skip existing manifestasi: ${item.poin}`);
    }

    const existingBreakdowns = await db
      .select()
      .from(manifestasiBreakdowns)
      .where(eq(manifestasiBreakdowns.manifestasiId, row.id));

    for (const b of item.breakdowns) {
      const already = existingBreakdowns.find((e) => e.label === b.label);
      if (already) {
        console.log(`  Skip existing breakdown: ${b.label ?? "(tanpa breakdown)"}`);
        continue;
      }
      await db.insert(manifestasiBreakdowns).values({
        manifestasiId: row.id,
        label: b.label,
        keterangan: b.keterangan,
        dalil: b.dalil,
        contoh: b.contoh,
      });
      console.log(`  Inserted breakdown: ${b.label ?? "(tanpa breakdown)"}`);
    }
  }

  console.log("Done seeding Manifestasi Iwa'.");
  process.exit(0);
}

seedManifestasi().catch((err) => {
  console.error(err);
  process.exit(1);
});
