// data/districts.js - Har bir hududning shahar va tumanlari
// (e'lon joylashda va filtrda ishlatiladi). Ro'yxatni shu yerda tahrirlash mumkin:
// qiymat sifatida nomning o'zi saqlanadi.

export const DISTRICTS = {
  TOSHKENT_SHAHAR: [
    'Bektemir', 'Chilonzor', 'Mirobod', "Mirzo Ulug'bek", 'Olmazor', 'Sergeli',
    'Shayxontohur', 'Uchtepa', 'Yakkasaroy', 'Yangihayot', 'Yashnobod', 'Yunusobod',
  ],
  TOSHKENT_VILOYATI: [
    'Nurafshon shahri', 'Angren shahri', 'Bekobod shahri', 'Chirchiq shahri', 'Olmaliq shahri',
    'Ohangaron shahri', "Yangiyo'l shahri", 'Bekobod tumani', "Bo'ka", "Bo'stonliq", 'Chinoz',
    'Ohangaron tumani', "Oqqo'rg'on", 'Parkent', 'Piskent', 'Qibray', 'Quyi Chirchiq',
    "O'rta Chirchiq", 'Toshkent tumani', "Yangiyo'l tumani", 'Yuqori Chirchiq', 'Zangiota',
  ],
  ANDIJON: [
    'Andijon shahri', 'Xonobod shahri', 'Andijon tumani', 'Asaka', 'Baliqchi', "Bo'z",
    'Buloqboshi', 'Izboskan', 'Jalaquduq', "Marhamat", "Oltinko'l", 'Paxtaobod',
    "Qo'rg'ontepa", 'Shahrixon', "Ulug'nor", "Xo'jaobod",
  ],
  BUXORO: [
    'Buxoro shahri', 'Kogon shahri', 'Buxoro tumani', "G'ijduvon", 'Jondor', 'Kogon tumani',
    'Olot', 'Peshku', "Qorako'l", 'Qorovulbozor', 'Romitan', 'Shofirkon', 'Vobkent',
  ],
  FARGONA: [
    "Farg'ona shahri", "Marg'ilon shahri", "Qo'qon shahri", 'Quvasoy shahri', "Bag'dod",
    'Beshariq', 'Buvayda', "Dang'ara", "Farg'ona tumani", 'Furqat', 'Oltiariq',
    "Qo'shtepa", 'Quva', 'Rishton', "So'x", 'Toshloq', "Uchko'prik", "O'zbekiston tumani", 'Yozyovon',
  ],
  JIZZAX: [
    'Jizzax shahri', 'Arnasoy', 'Baxmal', "Do'stlik", 'Forish', "G'allaorol", "Mirzacho'l",
    'Paxtakor', 'Sharof Rashidov', 'Yangiobod', 'Zafarobod', 'Zarbdor', 'Zomin',
  ],
  XORAZM: [
    'Urganch shahri', 'Xiva shahri', "Bog'ot", 'Gurlan', 'Hazorasp', "Qo'shko'pir", 'Shovot',
    "Tuproqqal'a", 'Urganch tumani', 'Xiva tumani', 'Xonqa', 'Yangiariq', 'Yangibozor',
  ],
  NAMANGAN: [
    'Namangan shahri', 'Chortoq', 'Chust', 'Kosonsoy', 'Mingbuloq', 'Namangan tumani', 'Norin',
    'Pop', "To'raqo'rg'on", "Uchqo'rg'on", 'Uychi', "Yangiqo'rg'on",
  ],
  NAVOIY: [
    'Navoiy shahri', 'Zarafshon shahri', 'Karmana', 'Konimex', 'Navbahor', 'Nurota',
    'Qiziltepa', 'Tomdi', 'Uchquduq', 'Xatirchi',
  ],
  QASHQADARYO: [
    'Qarshi shahri', 'Shahrisabz shahri', 'Chiroqchi', 'Dehqonobod', "G'uzor", 'Kasbi', 'Kitob',
    "Ko'kdala", 'Koson', 'Mirishkor', 'Muborak', 'Nishon', 'Qamashi', 'Qarshi tumani',
    'Shahrisabz tumani', "Yakkabog'",
  ],
  QORAQALPOGISTON: [
    'Nukus shahri', 'Amudaryo', 'Beruniy', "Bo'zatov", 'Chimboy', "Ellikqal'a", 'Kegeyli',
    "Mo'ynoq", 'Nukus tumani', "Qanliko'l", "Qo'ng'irot", "Qorao'zak", 'Shumanay',
    'Taxiatosh', "Taxtako'pir", "To'rtko'l", "Xo'jayli",
  ],
  SAMARQAND: [
    'Samarqand shahri', "Kattaqo'rg'on shahri", "Bulung'ur", 'Ishtixon', 'Jomboy',
    "Kattaqo'rg'on tumani", 'Narpay', 'Nurobod', 'Oqdaryo', 'Paxtachi', "Pastdarg'om",
    'Payariq', "Qo'shrabot", 'Samarqand tumani', 'Toyloq', 'Urgut',
  ],
  SIRDARYO: [
    'Guliston shahri', 'Shirin shahri', 'Yangiyer shahri', 'Boyovut', 'Guliston tumani',
    'Mirzaobod', 'Oqoltin', 'Sardoba', 'Sayxunobod', 'Sirdaryo tumani', 'Xovos',
  ],
  SURXONDARYO: [
    'Termiz shahri', 'Angor', 'Bandixon', 'Boysun', 'Denov', "Jarqo'rg'on", 'Muzrabot',
    'Oltinsoy', 'Qiziriq', "Qumqo'rg'on", 'Sariosiyo', 'Sherobod', "Sho'rchi", 'Termiz tumani', 'Uzun',
  ],
};

export function isValidDistrict(region, district) {
  return Boolean(region && district && DISTRICTS[region]?.includes(district));
}
