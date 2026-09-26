import { ServiceTicket } from '../types/service';

export const INITIAL_TICKETS: ServiceTicket[] = [
  {
    id: 'RC-2026-0842',
    createdAt: '2026-09-24T09:30:00Z',
    updatedAt: '2026-09-25T14:15:00Z',
    customer: {
      name: 'Rian Pratama',
      phone: '081289347712',
      email: 'rian.pratama92@gmail.com',
      address: 'Jl. Merdeka Barat No. 45, Kebayoran Baru, Jakarta Selatan',
      preferredChannel: 'both'
    },
    device: {
      category: 'laptop',
      brand: 'ASUS',
      model: 'ROG Zephyrus G14 (GA402RJ)',
      serialNumber: 'SN-ASUS-9842109',
      pinOrPassword: 'PIN: 1402',
      physicalCondition: 'Baret halus di cover bawah, segel baut terbuka, layar mulus tanpa gores.',
      accessories: ['Adaptor Original 240W', 'Sleeve Bag ROG'],
      photoUrls: []
    },
    complaints: [
      'Overheat / Suhu Sangat Panas & Bising',
      'Bluescreen (BSOD) Sering Restart'
    ],
    complaintDetail: 'Saat main game Cyberpunk atau render video Premiere tiba-tiba laptop freeze lalu restart dengan pesan error WHEA_UNCORRECTABLE_ERROR. Kipas berputar kencang maksimal.',
    deliveryMethod: 'dropoff',
    status: 'in_progress',
    priority: 'express',
    technician: {
      id: 'TECH-01',
      name: 'Bagus Setyawan, S.Kom',
      role: 'Lead Hardware & Chip-Level Specialist',
      phone: '0813-8821-9900'
    },
    estimate: {
      parts: [
        {
          id: 'P-01',
          name: 'Thermal Grizzly Conductonaut Liquid Metal & K5 Pro Viscous Thermal Pad',
          brand: 'Thermal Grizzly',
          price: 285000,
          warrantyPeriod: 'Garansi Aplikasi 6 Bulan'
        },
        {
          id: 'P-02',
          name: 'Penggantian IC Power MOSFET VCORE Motherboard (On-Board)',
          brand: 'Original Texas Instruments',
          price: 450000,
          warrantyPeriod: '90 Hari Garansi Chipset'
        }
      ],
      serviceFee: 350000,
      totalAmount: 1085000,
      estimatedCompletion: '2026-09-26T17:00:00Z',
      diagnosisNotes: 'Ditemukan pasta termal bawaan kering total dan satu MOSFET fasa GPU mengalami degradasi resistansi sehingga memicu drop tegangan saat full load.',
      isApproved: true,
      decisionAt: '2026-09-25T10:00:00Z',
      decisionNote: 'Disetujui pelanggan via WhatsApp'
    },
    timeline: [
      {
        id: 'TL-1',
        status: 'registered',
        title: 'Tiket Servis Didaftarkan',
        description: 'Pelanggan mendaftarkan permohonan servis online dengan keluhan overheat & BSOD.',
        timestamp: '2026-09-24T09:30:00Z',
        technicianName: 'Admin Republik Computer'
      },
      {
        id: 'TL-2',
        status: 'diagnosing',
        title: 'Unit Diterima & Diagnosa Dimulai',
        description: 'Unit diterima di workshop Republik Computer Pusat. Pembongkaran casing dan pengukuran multimeter jalur VCORE.',
        timestamp: '2026-09-24T14:00:00Z',
        technicianName: 'Bagus Setyawan'
      },
      {
        id: 'TL-3',
        status: 'waiting_approval',
        title: 'Estimasi Biaya & Kerusakan Dikirimkan',
        description: 'Rincian estimasi biaya perbaikan IC Power MOSFET & thermal replacement dikirimkan ke WhatsApp pelanggan.',
        timestamp: '2026-09-25T08:45:00Z',
        technicianName: 'Bagus Setyawan'
      },
      {
        id: 'TL-4',
        status: 'in_progress',
        title: 'Pelanggan Menyetujui - Pengerjaan Dimulai',
        description: 'Persetujuan biaya diterima. Teknisi melakukan soldering microsurgery IC MOSFET dan re-pasting liquid metal.',
        timestamp: '2026-09-25T10:15:00Z',
        technicianName: 'Bagus Setyawan'
      }
    ],
    qcChecks: [
      { id: 'QC-1', name: 'Power On & Booting Windows 11', status: 'passed' },
      { id: 'QC-2', name: 'Multimeter Voltage Stability 1.2V VCORE', status: 'passed' },
      { id: 'QC-3', name: 'Stress Test AIDA64 + Furmark 1 Jam', status: 'pending' },
      { id: 'QC-4', name: 'Port I/O, Keyboard, Speaker, Wi-Fi Test', status: 'pending' }
    ],
    warrantyInfo: {
      durationDays: 90,
      terms: 'Garansi mencakup komponen IC MOSFET yang diganti dan kestabilan suhu pengerjaan pasta liquid metal. Tidak mencakup kerusakan akibat tumpahan cairan baru atau jatuh.',
      validUntil: '2026-12-25'
    }
  },
  {
    id: 'RC-2026-0914',
    createdAt: '2026-09-25T11:00:00Z',
    updatedAt: '2026-09-25T15:30:00Z',
    customer: {
      name: 'Nadia Safitri',
      phone: '085712398455',
      email: 'nadia.safitri@outlook.com',
      address: 'Apartemen Green Pramuka Tower F-12, Cempaka Putih, Jakarta Pusat',
      preferredChannel: 'whatsapp'
    },
    device: {
      category: 'pc',
      brand: 'Custom Gaming Rig',
      model: 'AMD Ryzen 7 7800X3D + RTX 4070 Super',
      serialNumber: 'PC-CUST-8812',
      physicalCondition: 'Tempered glass bersih, sedikit debu pada radiator AIO cooler.',
      accessories: ['Kabel Power AC', 'Antena Wi-Fi Motherboard'],
      photoUrls: []
    },
    complaints: [
      'Mati Total / Tidak Bisa Nyala',
      'Port USB / Type-C / HDMI Rusak'
    ],
    complaintDetail: 'Kemarin malam terdengar bunyi letupan kecil dan bau hangus dari arah belakang PSU. Setelah itu PC sama sekali tidak merespon saat tombol power ditekan.',
    deliveryMethod: 'pickup',
    pickupAddress: 'Apartemen Green Pramuka Tower F-12, Cempaka Putih, Jakarta Pusat',
    status: 'waiting_approval',
    priority: 'normal',
    technician: {
      id: 'TECH-02',
      name: 'Dimas Kurniawan',
      role: 'Senior Desktop & PSU Specialist',
      phone: '0812-9934-1188'
    },
    estimate: {
      parts: [
        {
          id: 'P-03',
          name: 'Power Supply Seasonic Focus GX-750W 80+ Gold Full Modular',
          brand: 'Seasonic',
          price: 1850000,
          warrantyPeriod: 'Garansi Resmi Distributor 10 Tahun'
        },
        {
          id: 'P-04',
          name: 'Thermalright Frozen Prism 360 Liquid Cooler Re-Seating & Cable Management',
          brand: 'Thermalright',
          price: 150000,
          warrantyPeriod: 'Garansi Pemasangan 30 Hari'
        }
      ],
      serviceFee: 200000,
      totalAmount: 2200000,
      estimatedCompletion: '2026-09-27T14:00:00Z',
      diagnosisNotes: 'Kapasitor primer PSU lama meledak akibat lonjakan listrik PLN. Beruntung proteksi OVP/OCP berfungsi sehingga motherboard dan GPU RTX 4070 Super dipastikan aman.',
      isApproved: null
    },
    timeline: [
      {
        id: 'TL-10',
        status: 'registered',
        title: 'Tiket Servis Didaftarkan (Layanan Pickup)',
        description: 'Pelanggan mengajukan pickup unit PC rakitan dari apartemen pelanggan.',
        timestamp: '2026-09-25T11:00:00Z',
        technicianName: 'Sistem Otomatis'
      },
      {
        id: 'TL-11',
        status: 'diagnosing',
        title: 'Unit Tiba & Uji Pengecekan Tegangan',
        description: 'Unit dijemput tim logistik Republik Computer dan dites menggunakan PSU tester bench.',
        timestamp: '2026-09-25T13:40:00Z',
        technicianName: 'Dimas Kurniawan'
      },
      {
        id: 'TL-12',
        status: 'waiting_approval',
        title: 'Estimasi Biaya Siap - Menunggu Persetujuan Anda',
        description: 'Notifikasi otomatis terkirim ke WhatsApp pelanggan untuk persetujuan penggantian unit PSU baru.',
        timestamp: '2026-09-25T15:30:00Z',
        technicianName: 'Dimas Kurniawan'
      }
    ],
    qcChecks: [
      { id: 'QC-10', name: 'Proteksi Jalur 12V GPU & Motherboard', status: 'passed' },
      { id: 'QC-11', name: 'Instalasi PSU Baru', status: 'pending' },
      { id: 'QC-12', name: 'Power Burn-in Test 2 Jam', status: 'pending' }
    ],
    warrantyInfo: {
      durationDays: 90,
      terms: 'Garansi resmi PSU 10 tahun via Republik Computer, jasa instalasi garansi 90 hari.',
      validUntil: '2026-12-25'
    }
  },
  {
    id: 'RC-2026-1025',
    createdAt: '2026-09-23T10:15:00Z',
    updatedAt: '2026-09-25T16:00:00Z',
    customer: {
      name: 'Hendrik Wijaya',
      phone: '08119827364',
      email: 'hendrik.wijaya@fintechcorp.id',
      address: 'Kuningan City Office Park Lt. 18, Jakarta Selatan',
      preferredChannel: 'email'
    },
    device: {
      category: 'macbook',
      brand: 'Apple',
      model: 'MacBook Pro 14" M1 Pro (2021) Space Gray',
      serialNumber: 'C02G99KLMD6N',
      physicalCondition: 'Mulus 95%, keyboard tuts spacebar agak macet.',
      accessories: ['MagSafe 3 Cable', 'Adaptor 67W'],
      photoUrls: []
    },
    complaints: [
      'Baterai Drop / Kembung / Tidak Mengisi',
      'Keyboard Tidak Berfungsi / Ketik Sendiri'
    ],
    complaintDetail: 'Baterai status Service Recommended, cycle count 920. Tombol spasi dan huruf T kadang double typing.',
    deliveryMethod: 'dropoff',
    status: 'quality_control',
    priority: 'express',
    technician: {
      id: 'TECH-03',
      name: 'Faisal Ramadhan',
      role: 'Apple Certified Mac Technician',
      phone: '0812-7788-3321'
    },
    estimate: {
      parts: [
        {
          id: 'P-05',
          name: 'Topcase & Original OEM Battery Cell Replacement 70Wh',
          brand: 'Apple OEM Spec',
          price: 1950000,
          warrantyPeriod: '180 Hari Garansi Baterai'
        },
        {
          id: 'P-06',
          name: 'Keyboard Module Replacement & Ultra-Sonic Logic Board Cleaning',
          brand: 'Apple OEM Spec',
          price: 850000,
          warrantyPeriod: '90 Hari Garansi'
        }
      ],
      serviceFee: 300000,
      totalAmount: 3100000,
      estimatedCompletion: '2026-09-25T18:00:00Z',
      diagnosisNotes: 'Baterai mengalami degradasi kapasitas di bawah 68% dan sedikit cembung. Mekanisme scissor switch spacebar aus.',
      isApproved: true,
      decisionAt: '2026-09-23T14:20:00Z',
      decisionNote: 'Disetujui via email konfirmasi'
    },
    timeline: [
      {
        id: 'TL-20',
        status: 'registered',
        title: 'Pendaftaran Servis Diterima',
        description: 'Pelanggan mengantarkan unit ke workshop Republik Computer.',
        timestamp: '2026-09-23T10:15:00Z',
        technicianName: 'Front Office Republik'
      },
      {
        id: 'TL-21',
        status: 'diagnosing',
        title: 'Diagnosa Apple Diagnostics & Battery Health Check',
        description: 'Hasil diagnosa memvalidasi kebutuhan penggantian battery cell dan modul keyboard.',
        timestamp: '2026-09-23T12:00:00Z',
        technicianName: 'Faisal Ramadhan'
      },
      {
        id: 'TL-22',
        status: 'waiting_approval',
        title: 'Estimasi Biaya Disetujui Pelanggan',
        description: 'Pelanggan menyetujui total biaya Rp 3.100.000.',
        timestamp: '2026-09-23T14:20:00Z',
        technicianName: 'Faisal Ramadhan'
      },
      {
        id: 'TL-23',
        status: 'in_progress',
        title: 'Proses Pemasangan Topcase & Kalibrasi',
        description: 'Baterai baru dan keyboard terpasang rapi dengan adhesive original Apple spec.',
        timestamp: '2026-09-24T11:00:00Z',
        technicianName: 'Faisal Ramadhan'
      },
      {
        id: 'TL-24',
        status: 'quality_control',
        title: 'Pengujian Kalibrasi & QC Baterai Berjalan',
        description: 'Sedang dilakukan pengujian siklus pengisian 0% - 100% dan tes beban rendering Final Cut Pro.',
        timestamp: '2026-09-25T16:00:00Z',
        technicianName: 'Faisal Ramadhan'
      }
    ],
    qcChecks: [
      { id: 'QC-20', name: 'Apple Hardware Test (AHT) Diagnostic Pass', status: 'passed' },
      { id: 'QC-21', name: 'Kalibrasi Siklus Pengisian Baterai Normal', status: 'passed' },
      { id: 'QC-22', name: 'Tes Semua Tombol Keyboard & Backlight LED', status: 'passed' },
      { id: 'QC-23', name: 'Trackpad Force Touch Haptic Feedback', status: 'passed' }
    ],
    warrantyInfo: {
      durationDays: 180,
      terms: 'Garansi resmi perbaikan 6 bulan untuk baterai dan 90 hari untuk modul keyboard.',
      validUntil: '2027-03-24'
    }
  },
  {
    id: 'RC-2026-1102',
    createdAt: '2026-09-22T08:00:00Z',
    updatedAt: '2026-09-25T17:30:00Z',
    customer: {
      name: 'Agus Setiawan',
      phone: '087811223344',
      email: 'agus.setiawan@gmail.com',
      address: 'Jl. Surya Kencana No. 88, Bogor',
      preferredChannel: 'whatsapp'
    },
    device: {
      category: 'gpu',
      brand: 'MSI',
      model: 'GeForce RTX 3070 Ti Suprim X 8GB',
      serialNumber: 'MSI-602-V397-RTX',
      physicalCondition: 'Heatsink terawat, stiker segel utuh sebelum servis.',
      accessories: ['Box Original', 'GPU Support Bracket'],
      photoUrls: []
    },
    complaints: [
      'Layar Pecah / Bergaris / Artifact',
      'Layar Blank / No Display'
    ],
    complaintDetail: 'Keluaran display ada garis kotak-kotak hijau ungu (artifact) lalu crash black screen saat driver NVIDIA di-load.',
    deliveryMethod: 'dropoff',
    status: 'completed',
    priority: 'normal',
    technician: {
      id: 'TECH-01',
      name: 'Bagus Setyawan, S.Kom',
      role: 'Lead Hardware & Chip-Level Specialist',
      phone: '0813-8821-9900'
    },
    estimate: {
      parts: [
        {
          id: 'P-07',
          name: 'Micron GDDR6X VRAM Chip Replacement (Bank C1)',
          brand: 'Micron Tech Original',
          price: 550000,
          warrantyPeriod: '90 Hari Garansi VRAM'
        },
        {
          id: 'P-08',
          name: 'Thermal Pad Extreme 12.8 W/mK Gelid Solutions Replacement',
          brand: 'Gelid Solutions',
          price: 220000,
          warrantyPeriod: 'Garansi Suhu Stabil'
        }
      ],
      serviceFee: 400000,
      totalAmount: 1170000,
      estimatedCompletion: '2026-09-25T15:00:00Z',
      diagnosisNotes: 'MATS error log mendeteksi bad memory sector pada bank VRAM C1. Penggantian IC chip VRAM dan re-balling berhasil.',
      isApproved: true,
      decisionAt: '2026-09-22T14:00:00Z'
    },
    timeline: [
      {
        id: 'TL-30',
        status: 'registered',
        title: 'Unit Diterima di Meja Servis',
        description: 'GPU diserahkan langsung oleh pelanggan.',
        timestamp: '2026-09-22T08:00:00Z',
        technicianName: 'Admin Republik'
      },
      {
        id: 'TL-31',
        status: 'diagnosing',
        title: 'MATS Diagnostic Memory Test',
        description: 'Software diagnosis mendeteksi bad IC VRAM di jalur C1.',
        timestamp: '2026-09-22T10:30:00Z',
        technicianName: 'Bagus Setyawan'
      },
      {
        id: 'TL-32',
        status: 'waiting_approval',
        title: 'Estimasi Disetujui',
        description: 'Pelanggan menyetujui penggantian chip memory baru.',
        timestamp: '2026-09-22T14:00:00Z',
        technicianName: 'Bagus Setyawan'
      },
      {
        id: 'TL-33',
        status: 'in_progress',
        title: 'BGA Rework Station & Solder VRAM Baru',
        description: 'Penggantian chip Micron VRAM menggunakan profile suhu presisi 220C.',
        timestamp: '2026-09-23T11:00:00Z',
        technicianName: 'Bagus Setyawan'
      },
      {
        id: 'TL-34',
        status: 'quality_control',
        title: '3DMark Time Spy & Furmark 24 Jam Pass',
        description: 'GPU berjalan stabil pada resolusi 4K tanpa artifact, suhu maksimal 66C.',
        timestamp: '2026-09-24T16:00:00Z',
        technicianName: 'Bagus Setyawan'
      },
      {
        id: 'TL-35',
        status: 'completed',
        title: 'Selesai 100% & Siap Diambil',
        description: 'Unit sudah dikemas kembali ke dalam box dengan rapi. Siap diambil di workshop Republik Computer.',
        timestamp: '2026-09-25T17:30:00Z',
        technicianName: 'Bagus Setyawan'
      }
    ],
    qcChecks: [
      { id: 'QC-30', name: 'NVIDIA MATS Test 0 Error', status: 'passed' },
      { id: 'QC-31', name: 'Furmark 1440p Stress Test 30 Menit (Max 67°C)', status: 'passed' },
      { id: 'QC-32', name: '3DMark Time Spy Loop 20x Pass', status: 'passed' },
      { id: 'QC-33', name: 'Semua Port DP & HDMI Menampilkan Gambar Jernih', status: 'passed' }
    ],
    warrantyInfo: {
      durationDays: 90,
      terms: 'Garansi 90 hari sparepart VRAM dan jasa pengerjaan teknisi Republik Computer.',
      validUntil: '2026-12-24'
    }
  }
];
