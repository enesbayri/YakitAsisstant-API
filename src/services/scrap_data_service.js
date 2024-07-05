
const puppeteer = require("puppeteer");
const sehirListeleri = require("../tools/cityList.json");
const fs=require("fs");
const fuelRepo=require("../repository/fuel_repo");

const fromTurkishChar=require("./fix_char_service");

//Json VERİ ALINIYOR - VERİ DÜZENLİ HALE GETİRİLDİ - HER İL TOPLU ALINIYOR!
petrolOfisiYakitFiyatlari = async () => {
    const veriDuzenle = (links) => {
        const veri = links[0].replace(" ", "").replace("\n", "").replace("  ", "").split(" ");   //gelen veriyi boşlukları ve \n leri "" boş karaktere çevirip sonra split ile diziye çevirdik. 

        for (let i = 0; i < veri.length; i++) {  //dizide şehir adları ve fiyatlar dışında "boşluk,\n,tab" gibi şeylerin olmasını engelledik. ascii tablosu ile...

            if ((veri[i].charCodeAt(0) >= 65 && veri[i].charCodeAt(0) <= 90) || (veri[i].charCodeAt(0) >= 48 && veri[i].charCodeAt(0) <= 57)) {
                veri[i] = veri[i].replace("\n", "");
            } else {
                veri.splice(i, 1);
                i -= 1;
            }

        }

        for (let i = 0; i < veri.length; i++) { //TL/LT ifadesinden önce kdv siz fiyatlar  vardı ,onları çıkardık
            if ((veri[i] == 'TL/LT')) {
                veri.splice(i - 1, 1);
                i -= 1;;
            }
        }

        for (let i = 0; i < veri.length; i++) {  //"TL/LT" idafelerini diziden çıkardık
            if ((veri[i] == 'TL/LT')) {
                veri.splice(i, 1);
                i -= 1;;
            }
        }
    
        //dizi halinde gelen yakit fiyatlarını il isimlerine göre JSON haline çeviriyoruz!!
        let cleanData = {};
        let il;
        veri.forEach((e, index) => {

            if (index == 0 || index % 5 == 0) {
                e=fromTurkishChar(e);
                il = e;
                cleanData[e] = [];
            } else {
                cleanData[il].push(e);
            }
        })
        return cleanData;
    }

    const fiyatlariCek = async () => {
        try {
            const url = `https://www.petrolofisi.com.tr/akaryakit-fiyatlari`;


            const browser = await puppeteer.launch({ headless: "new" });
            const page = await browser.newPage();

            await page.goto(url, {
                waitUntil: "networkidle0",
            });

            //------------------------------------------------------------------------------------------------------------------------------------
            //buradan
            const resultsSelector = 'body > section.prices-list.fuel-module > div > div > div.fuel-items > div > table > tbody';   //** kullanacağın veriyi inceleden bul sağ tıkla, copy menüsüne gel ,"copy selector" butonuna tıklayıp selector ifadesini kopyalamış olursun.
            //bu senin sayfanda bulmasını istediğin etiketlerin binevi yerini tarif eder. biz tüm tablo içeriklerini(tüm şehrin ilçelerini) çekeceğimiz için "tbody" de bitirdik ki tamamı gelsin diye 
            const links = await page.evaluate(resultsSelector => {
                const anchors = Array.from(document.querySelectorAll(resultsSelector));
                return anchors.map(anchor => {
                    const title = anchor.textContent.trim();
                    return title;
                });
            }, resultsSelector);
            // buraya kadar olan kodlar sabit dökümandan kopyalanmış şekilde kullanılmıştır . puppeteer güncel içerik çekme yöntemidir.
            //------------------------------------------------------------------------------------------------------------------------------------

            //buradan sonrası ise bizim veriyi temiz hale getirmemizi sağlar.(okunuşunu ve yapısını)

            const cleanData = veriDuzenle(links)


            //veriyi yazdırıyoruz
            console.log(cleanData);

            await browser.close();

            return cleanData;
        } catch (e) {
            console.log("PO sehir cekilemedi!");
        }
    }


    let fiyatlar = await fiyatlariCek();
    console.log("\nPO\n--------------------------------------------");
    console.log(fiyatlar);
    
    fs.writeFileSync("POAkaryakit.txt",JSON.stringify(fiyatlar));
    fuelRepo.addFuelCost("po",JSON.stringify(fiyatlar));




}



//Json VERİ ALINIYOR - VERİ DÜZENLİ HALE GETİRİLDİ - HER İL TEK TEK ALINIYOR!
SoilAkaryakitFiyatlari = async () => {
    const veriyiDuzenle = (links) => {
        let cleanData = {};
        let il;
        let fiyat;
        let fiyatDizi = [];
        for (let i = 0; i < links[0].length; i++) {


            if ((links[0][i].charCodeAt(0) >= 65 && links[0][i].charCodeAt(0) <= 90) || links[0][i] == "Ğ" || links[0][i] == "Ş" || links[0][i] == "Ü" || links[0][i] == "Ö" || links[0][i] == "İ" || links[0][i] == "Ç") {
                for (let j = i; j < links[0].length; j++) {
                    if (links[0][j].charCodeAt(0) >= 48 && links[0][j].charCodeAt(0) <= 57) {
                        il = links[0].slice(i, j);
                        i = j - 1;
                        break;
                    }
                }

            }
            if ((links[0][i].charCodeAt(0) >= 48 && links[0][i].charCodeAt(0) <= 57) || links[0][i] == ",") {
                for (let j = i; j < links[0].length; j++) {
                    if ((links[0][j].charCodeAt(0) >= 65 && links[0][j].charCodeAt(0) <= 90) || links[0][j] == "Ğ" || links[0][j] == "Ş" || links[0][j] == "Ü" || links[0][j] == "Ö" || links[0][j] == "İ" || links[0][j] == "Ç") {
                        fiyat = links[0].slice(i, j);
                        for (let index = 1; index < fiyat.length; index++) {
                            if (index % 5 == 0) {
                                fiyatDizi.push(fiyat.slice(index - 5, index))
                            }


                        }
                        if (il == "İÇEL (Mersin)") { il = 'Mersin'; }
                        cleanData[fromTurkishChar(il)] = fiyatDizi;
                        fiyatDizi = [];
                        i = j - 1;
                        break;
                    }
                }
                //ilçeleri de dahil etmemesi için  bu BREAK kullanılıyor bu BREAK kaldırılırsa ilçeler de gelir veri olarak!!
                break
            }


        }
        return cleanData;
    }

    const SoilAkaryakitfiyatlariCek = async (kod) => {
        try {
            const url = `https://soil.com.tr/fiyatlar/`;


            const browser = await puppeteer.launch({ headless: "new" });
            const page = await browser.newPage();

            await page.goto(url, {
                waitUntil: "networkidle0",
            });

            //dropdown menüden sehir seçiyoruz.        
            await page.click('#table_1_9_filter > span > div > button');

            //34 ten sonraki iller için 1 fazla inmen lazım çünkü 34 üncü seçenek istanbul-anadolu 35-istanbul-avrupa alduğu için 34 ten sonraki iller 1 kayar.

            for (let i = 0; i < kod + 1; i++) {
                await page.keyboard.press('ArrowDown');
            }

            await page.keyboard.press('Enter');

            await page.waitForNetworkIdle();
            //await page.screenshot({fullPage:true,path:"sadasd.png",type:"png"});
            //ara butonuna basıyoruz.
            //await page.click("body > section.fiyatlarDetay > div > div > div:nth-child(1) > div > div:nth-child(5) > input[type=button]");



            const resultsSelector = '#table_1 > tbody';
            //petrol sayfası sunucusu yavaşlayabilir o yüzden şehri seçince veriler biraz gecikebilir ondan dolayı waitforSelector ile tablonun gelmesini bekle diyoruz önce!!!
            await page.waitForSelector(resultsSelector);
            const links = await page.evaluate(resultsSelector => {
                const anchors = Array.from(document.querySelectorAll(resultsSelector));
                return anchors.map(anchor => {
                    const title = anchor.textContent.trim();
                    return title;
                });
            }, resultsSelector);


            //VERİYİ İL-FİYAT ŞEKLİNDE JSON TİPİNE ÇEVİRİYORUZ

            let cleanData = veriyiDuzenle(links);



            await browser.close();
            return cleanData;
        } catch (e) {
            console.log("SOİL akaryakıt fiyatları çekilemedi");
            await SoilAkaryakitfiyatlariCek(kod);
        }
    }


    const soilAkaryakitList = [];
    console.log("\nSOİL\n--------------------------------------------");

    const sehirGetir = async (i) => {

        let f1 = await SoilAkaryakitfiyatlariCek(i);

        soilAkaryakitList.push(f1);

        console.log(i + "---------- Soil akaryakit cekildi");
        
        
        if(i==81){
            fs.writeFileSync("SoilAkaryakit.txt",JSON.stringify(soilAkaryakitList));
            fuelRepo.addFuelCost("soil",JSON.stringify(soilAkaryakitList));
        }



    }



    await sehirGetir(1);
    await sehirGetir(2);
    await sehirGetir(3);
    await sehirGetir(4);
    await sehirGetir(5);
    await sehirGetir(6);
    await sehirGetir(7);
    await sehirGetir(8);
    await sehirGetir(9);
    await sehirGetir(10);
    await sehirGetir(11);
    await sehirGetir(12);
    await sehirGetir(13);
    await sehirGetir(14);
    await sehirGetir(15);
    await sehirGetir(16);
    await sehirGetir(17);
    await sehirGetir(18);
    await sehirGetir(19);
    await sehirGetir(20);
    await sehirGetir(21);
    await sehirGetir(22);
    await sehirGetir(23);
    await sehirGetir(24);
    await sehirGetir(25);
    await sehirGetir(26);
    await sehirGetir(27);
    await sehirGetir(28);
    await sehirGetir(29);
    await sehirGetir(30);
    await sehirGetir(31);
    await sehirGetir(32);
    await sehirGetir(33);
    await sehirGetir(34);
    await sehirGetir(35);
    await sehirGetir(36);
    await sehirGetir(37);
    await sehirGetir(38);
    await sehirGetir(39);
    await sehirGetir(40);
    await sehirGetir(41);
    await sehirGetir(42);
    await sehirGetir(43);
    await sehirGetir(44);
    await sehirGetir(45);
    await sehirGetir(46);
    await sehirGetir(47);
    await sehirGetir(48);
    await sehirGetir(49);
    await sehirGetir(50);
    await sehirGetir(51);
    await sehirGetir(52);
    await sehirGetir(53);
    await sehirGetir(54);
    await sehirGetir(55);
    await sehirGetir(56);
    await sehirGetir(57);
    await sehirGetir(58);
    await sehirGetir(59);
    await sehirGetir(60);
    await sehirGetir(61);
    await sehirGetir(62);
    await sehirGetir(63);
    await sehirGetir(64);
    await sehirGetir(65);
    await sehirGetir(66);
    await sehirGetir(67);
    await sehirGetir(68);
    await sehirGetir(69);
    await sehirGetir(70);
    await sehirGetir(71);
    await sehirGetir(72);
    await sehirGetir(73);
    await sehirGetir(74);
    await sehirGetir(75);
    await sehirGetir(76);
    await sehirGetir(77);
    await sehirGetir(78);
    await sehirGetir(79);
    await sehirGetir(80);
    await sehirGetir(81);







}

SoilLpgFiyatlari = async () => {
    const SoilLpgfiyatlariCek = async (kod) => {
        try {
            const url = `https://www.soilgaz.com.tr/pompa-fiyatlari/`;


            const browser = await puppeteer.launch({ headless: "new" });
            const page = await browser.newPage();
            //**** waitUntil sayfanın başında loading ekranı varsa yüklenmesini sağlar!!!  Bunu yapmazsan devamındaki verileri alamazsın işlemlerinde hata alırsın dropdown seçme click vs işlemlerde!!!
            await page.goto(url, {
                waitUntil: "networkidle0",
            });

            //dropdown menüden sehir seçiyoruz.        
            await page.click('.PompaSehir');
            //34 ten sonraki iller için 1 fazla inmen lazım çünkü 34 üncü seçenek istanbul-anadolu 35-istanbul-avrupa alduğu için 34 ten sonraki iller 1 kayar.
            for (let i = 0; i < kod; i++) {
                await page.keyboard.press('ArrowDown');
            }
            //await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');


            //ara butonuna basıyoruz.
            await page.click("body > div.page-wrapper > section.nedenOtogaz > div > div > div.col-12 > div > div:nth-child(5) > input[type=button]");

            //verinin gelmesi için süre tanıyoruz sayfaya!!!
            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            await sleep(3000)

            //hata varmı falan diye işlemin ekran resmini lıp bakabiliriz!!!
            //await page.screenshot({fullPage:true,path:"sadasd.png",type:"png"});

            const resultsSelector = 'body > div.page-wrapper > section.nedenOtogaz > div > div > div.col-12 > div > div:nth-child(6) > div > span';

            const links = await page.evaluate(resultsSelector => {
                const anchors = Array.from(document.querySelectorAll(resultsSelector));
                return anchors.map(anchor => {
                    const title = anchor.textContent.trim();
                    return title;
                });
            }, resultsSelector);
            let cleanData = {};
            cleanData[fromTurkishChar(sehirListeleri.SoilLpgSehirListesi[kod - 1])] = links[0];



            await browser.close();
            return cleanData;
        } catch (e) {
            await SoilLpgfiyatlariCek(kod);
        }
    }
    const soilLpgList = [];
    console.log("\nSOİL\n--------------------------------------------");

    const sehirGetir = async (i) => {


        let f2 = await SoilLpgfiyatlariCek(i);

        soilLpgList.push(f2);
        console.log(i + "---------- Soil LPG cekildi");
        
        if(i==81){
            fs.writeFileSync("SoilLPG.txt",JSON.stringify(soilLpgList));
            fuelRepo.addFuelCost("soilLpg",JSON.stringify(soilLpgList));
        }

    }



    await sehirGetir(1);
    await sehirGetir(2);
    await sehirGetir(3);
    await sehirGetir(4);
    await sehirGetir(5);
    await sehirGetir(6);
    await sehirGetir(7);
    await sehirGetir(8);
    await sehirGetir(9);
    await sehirGetir(10);
    await sehirGetir(11);
    await sehirGetir(12);
    await sehirGetir(13);
    await sehirGetir(14);
    await sehirGetir(15);
    await sehirGetir(16);
    await sehirGetir(17);
    await sehirGetir(18);
    await sehirGetir(19);
    await sehirGetir(20);
    await sehirGetir(21);
    await sehirGetir(22);
    await sehirGetir(23);
    await sehirGetir(24);
    await sehirGetir(25);
    await sehirGetir(26);
    await sehirGetir(27);
    await sehirGetir(28);
    await sehirGetir(29);
    await sehirGetir(30);
    await sehirGetir(31);
    await sehirGetir(32);
    await sehirGetir(33);
    await sehirGetir(34);
    await sehirGetir(35);
    await sehirGetir(36);
    await sehirGetir(37);
    await sehirGetir(38);
    await sehirGetir(39);
    await sehirGetir(40);
    await sehirGetir(41);
    await sehirGetir(42);
    await sehirGetir(43);
    await sehirGetir(44);
    await sehirGetir(45);
    await sehirGetir(46);
    await sehirGetir(47);
    await sehirGetir(48);
    await sehirGetir(49);
    await sehirGetir(50);
    await sehirGetir(51);
    await sehirGetir(52);
    await sehirGetir(53);
    await sehirGetir(54);
    await sehirGetir(55);
    await sehirGetir(56);
    await sehirGetir(57);
    await sehirGetir(58);
    await sehirGetir(59);
    await sehirGetir(60);
    await sehirGetir(61);
    await sehirGetir(62);
    await sehirGetir(63);
    await sehirGetir(64);
    await sehirGetir(65);
    await sehirGetir(66);
    await sehirGetir(67);
    await sehirGetir(68);
    await sehirGetir(69);
    await sehirGetir(70);
    await sehirGetir(71);
    await sehirGetir(72);
    await sehirGetir(73);
    await sehirGetir(74);
    await sehirGetir(75);
    await sehirGetir(76);
    await sehirGetir(77);
    await sehirGetir(78);
    await sehirGetir(79);
    await sehirGetir(80);
    await sehirGetir(81);


}


//Json VERİ ALINIYOR - VERİ DÜZENLİ HALE GETİRİLDİ - HER İL TEK TEK ALINIYOR!
ShellYakitFiyatlari = async () => {
    const veriyiDuzenle = (links) => {
        for (let i = 0; i < links.length; i++) {
            if (links[i] == "-") {
                links = links.replace("-", "");
                i--;
            }

        }

        let cleanData = {};
        let il;
        let fiyat;
        let fiyatDizi = [];
        for (let i = 0; i < links.length; i++) {

            if ((links[i].charCodeAt(0) >= 65 && links[i].charCodeAt(0) <= 90) || links[i] == "Ğ" || links[i] == "Ş" || links[i] == "Ü" || links[i] == "Ö" || links[i] == "İ" || links[i] == "Ç") {

                for (let j = i; j < links.length; j++) {
                    if (links[j].charCodeAt(0) >= 48 && links[j].charCodeAt(0) <= 57) {
                        il = links.slice(i, j);
                        i = j - 1;
                        break;
                    }
                }
            } else {
                fiyat = links.slice(i, links.length);
                if (fiyat.length > 8) {
                    for (let index = 1; index < fiyat.length; index++) {
                        if (index % 5 == 0) {
                            fiyatDizi.push(fiyat.slice(index - 5, index))
                        }
                    }
                } else {
                    fiyatDizi.push(fiyat)
                }
                break;
            }
            cleanData[fromTurkishChar(il)] = fiyatDizi;



        }
        return cleanData;
    }
    tryCount=0;
    const ShellAkaryakitfiyatlariCek = async (kod) => {
        try {
            const url = `https://www.turkiyeshell.com/pompatest/`;


            const browser = await puppeteer.launch({ headless: "new" });
            const page = await browser.newPage();

            await page.goto(url, {
                waitUntil: "networkidle0",
            });

            //dropdown menüden sehir seçiyoruz.        
            await page.click('#cb_all_cb_province_I');
            for (let i = 0; i < kod; i++) {
                await page.keyboard.press('ArrowDown');
            }
            //await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');




            //await page.screenshot({fullPage:true,path:"sadasd.png",type:"png"});


            const resultsSelector2 = '#cb_all_grdPrices_DXDataRow0';
            //petrol sayfası sunucusu yavaşlayabilir o yüzden şehri seçince veriler biraz gecikebilir ondan dolayı waitforSelector ile tablonun gelmesini bekle diyoruz önce!!!
            await page.waitForSelector(resultsSelector2);
            const links2 = await page.evaluate(resultsSelector2 => {
                const anchors = Array.from(document.querySelectorAll(resultsSelector2));
                return anchors.map(anchor => {
                    const title = anchor.textContent.trim();
                    return title;
                });
            }, resultsSelector2);


            //VERİYİ DÜZENLİYORUZ!!



            //veriyi yazdırıyoruz
            let cleanData2 = veriyiDuzenle(links2[0]);

            //hakkari ili verisinde çekilen sistemden dolayı kontrol yapıyoruz!
            for(key in cleanData2){
                if(key=="YUKSEKOVA"){
                    let gecici={};
                    gecici["Hakkari"]=cleanData2["YUKSEKOVA"];
                    delete cleanData2["YUKSEKOVA"];
                    cleanData2["Hakkari"]=gecici["Hakkari"];

                }
            }
            if (kod != 36) {
                const resultsSelector = '#cb_all_grdPrices_DXDataRow1';
                //petrol sayfası sunucusu yavaşlayabilir o yüzden şehri seçince veriler biraz gecikebilir ondan dolayı waitforSelector ile tablonun gelmesini bekle diyoruz önce!!!
                await page.waitForSelector(resultsSelector);
                const links = await page.evaluate(resultsSelector => {
                    const anchors = Array.from(document.querySelectorAll(resultsSelector));
                    return anchors.map(anchor => {
                        const title = anchor.textContent.trim();
                        return title;
                    });
                }, resultsSelector);
                let cleanData1 = veriyiDuzenle(links[0]);
                cleanData2[Object.keys(cleanData2)[0]]=[...cleanData2[Object.keys(cleanData2)[0]],...Object.values(cleanData1)[0]];

            }





            await browser.close();
            tryCount=0;
            return cleanData2;
        } catch (e) {
            console.log("Shell sehir çekilemedi!");
            await ShellAkaryakitfiyatlariCek(kod);
        }
    }



    console.log("\nSHELL\n--------------------------------------------");
    const shellAkaryakitList = [];

    const sehirGetir = async (i) => {

        let f1 = await ShellAkaryakitfiyatlariCek(i);

        shellAkaryakitList.push(f1);
        console.log(i + "---------- SHELL Akaryakit cekildi");
        if(i==79){
            fs.writeFileSync("ShellAkaryakit.txt",JSON.stringify(shellAkaryakitList));
            fuelRepo.addFuelCost("shell",JSON.stringify(shellAkaryakitList));
        }



    }
    
    await sehirGetir(1);
    await sehirGetir(2);
    await sehirGetir(3);
    await sehirGetir(4);
    await sehirGetir(5);
    await sehirGetir(6);
    await sehirGetir(7);
    await sehirGetir(8);
    await sehirGetir(9);
    await sehirGetir(10);
    await sehirGetir(11);
    await sehirGetir(12);
    await sehirGetir(13);
    await sehirGetir(14);
    await sehirGetir(15);
    await sehirGetir(16);
    await sehirGetir(17);
    await sehirGetir(18);
    await sehirGetir(19);
    await sehirGetir(20);
    await sehirGetir(21);
    await sehirGetir(22);
    await sehirGetir(23);
    await sehirGetir(24);
    await sehirGetir(25);
    await sehirGetir(26);
    await sehirGetir(27);
    await sehirGetir(28);
    await sehirGetir(29);
    await sehirGetir(30);
    await sehirGetir(31);
    await sehirGetir(32);
    await sehirGetir(33);
    await sehirGetir(34);
    await sehirGetir(35);
    await sehirGetir(36);
    await sehirGetir(37);
    await sehirGetir(38);
    await sehirGetir(39);
    await sehirGetir(40);
    await sehirGetir(41);
    await sehirGetir(42);
    await sehirGetir(43);
    await sehirGetir(44);
    await sehirGetir(45);
    await sehirGetir(46);
    await sehirGetir(47);
    await sehirGetir(48);
    await sehirGetir(49);
    await sehirGetir(50);
    await sehirGetir(51);
    await sehirGetir(52);
    await sehirGetir(53);
    await sehirGetir(54);
    await sehirGetir(55);
    await sehirGetir(56);
    await sehirGetir(57);
    await sehirGetir(58);
    await sehirGetir(59);
    await sehirGetir(60);
    await sehirGetir(61);
    await sehirGetir(62);
    await sehirGetir(63);
    await sehirGetir(64);
    await sehirGetir(65);
    await sehirGetir(66);
    await sehirGetir(67);
    await sehirGetir(68);
    await sehirGetir(69);
    await sehirGetir(70);
    await sehirGetir(71);
    await sehirGetir(72);
    await sehirGetir(73);
    await sehirGetir(74);
    await sehirGetir(75);
    await sehirGetir(76);
    await sehirGetir(77);
    await sehirGetir(78);
    await sehirGetir(79);
}


//Json VERİ ALINIYOR - VERİ DÜZENLİ HALE GETİRİLDİ - HER İL TOPLU ALINIYOR!
aytemizYakitFiyatlari = async () => {
    const veriyiDuzenle = (links) => {
        let cleanData = [];
        let pre = 0;
        for (let i = 1; i < links[0].length; i++) {

            if ((links[0][i].charCodeAt(0) >= 65 && links[0][i].charCodeAt(0) <= 90) || links[0][i] == "Ş" || links[0][i] == "Ç" || links[0][i] == "İ") {
                let tr = links[0].slice(pre, i);
                let mapSlice = 0;
                for (let a = 0; a < tr.length; a++) {
                    if (tr[a].charCodeAt(0) >= 48 && tr[a].charCodeAt(0) <= 57) {
                        mapSlice = a;
                        break;
                    }

                }
                let mapTr = {};
                let fiyat = tr.slice(mapSlice, tr.length);
                let fiyatDizi = [];
                for (let index = 1; index < fiyat.length; index++) {
                    if (index % 5 == 0) {
                        fiyatDizi.push(fiyat.slice(index - 5, index))
                    }


                }
                mapTr[fromTurkishChar(tr.slice(0, mapSlice))] = (fiyatDizi);
                cleanData.push(mapTr);
                pre = i;
            }

        }
        return cleanData;
    }
    const lpgVerisiDuzenle = (links) => {
        let cleanData = [];
        let pre = 0;
        for (let i = 1; i < links[0].length; i++) {

            if ((links[0][i].charCodeAt(0) >= 65 && links[0][i].charCodeAt(0) <= 90) || links[0][i] == "Ş" || links[0][i] == "Ç" || links[0][i] == "İ") {
                let tr = links[0].slice(pre, i);
                let mapSlice = 0;
                for (let a = 0; a < tr.length; a++) {
                    if (tr[a].charCodeAt(0) >= 48 && tr[a].charCodeAt(0) <= 57) {
                        mapSlice = a;
                        break;
                    }

                }
                let mapTr = {};
                mapTr[fromTurkishChar( tr.slice(0, mapSlice))] = (tr.slice(mapSlice, tr.length));
                cleanData.push(mapTr);
                pre = i;
            }

        }
        return cleanData;
    }
    const aytemizAkaryakitfiyatlariCek = async () => {
        try {
            const url = `https://www.aytemiz.com.tr/akaryakit-fiyatlari/benzin-fiyatlari`;


            const browser = await puppeteer.launch({ headless: "new" });
            const page = await browser.newPage();

            await page.goto(url, {
                waitUntil: "networkidle0",
            });


            //await page.click('#table_1_9_filter > span > div > button');
            //34 ten sonraki iller için 1 fazla inmen lazım çünkü 34 üncü seçenek istanbul-anadolu 35-istanbul-avrupa alduğu için 34 ten sonraki iller 1 kayar.

            //await page.keyboard.press('ArrowDown');
            //await page.keyboard.press('Enter');

            //ara butonuna basıyoruz.
            //await page.click("body > section.fiyatlarDetay > div > div > div:nth-child(1) > div > div:nth-child(5) > input[type=button]");



            const resultsSelector = '#fuel-price-table > tbody';
            //petrol sayfası sunucusu yavaşlayabilir o yüzden şehri seçince veriler biraz gecikebilir ondan dolayı waitforSelector ile tablonun gelmesini bekle diyoruz önce!!!
            await page.waitForSelector(resultsSelector);
            const links = await page.evaluate(resultsSelector => {
                const anchors = Array.from(document.querySelectorAll(resultsSelector));
                return anchors.map(anchor => {
                    const title = anchor.textContent.trim();
                    return title;
                });
            }, resultsSelector);


            //GELEN VERİYİ İL İSİMLERİ İLE YAKIT FİYATLARI KARŞILIKLI OLACAK ŞEKİLDE JSON FORMATINA ÇEVİRİYORUZ
            const cleanData = veriyiDuzenle(links);


            await browser.close();
            return cleanData;
        } catch (e) {
            console.log("Aytemiz akaryakit sehir çekilemedi!");
        }
    }

    const aytemizLpgfiyatlariCek = async () => {
        try {
            const url = `https://www.aytemiz.com.tr/akaryakit-fiyatlari/benzin-fiyatlari`;


            const browser = await puppeteer.launch({ headless: "new" });
            const page = await browser.newPage();

            await page.goto(url, {
                waitUntil: "networkidle0",
            });


            await page.click('#form1 > section > article > div.priceTypes > a:nth-child(2)');
            //34 ten sonraki iller için 1 fazla inmen lazım çünkü 34 üncü seçenek istanbul-anadolu 35-istanbul-avrupa alduğu için 34 ten sonraki iller 1 kayar.

            //await page.keyboard.press('ArrowDown');
            //await page.keyboard.press('Enter');

            //ara butonuna basıyoruz.
            //await page.click("body > section.fiyatlarDetay > div > div > div:nth-child(1) > div > div:nth-child(5) > input[type=button]");



            const resultsSelector = '#form1 > section > article > div.price-table-responsive > table:nth-child(2) > tbody';
            //petrol sayfası sunucusu yavaşlayabilir o yüzden şehri seçince veriler biraz gecikebilir ondan dolayı waitforSelector ile tablonun gelmesini bekle diyoruz önce!!!
            await page.waitForSelector(resultsSelector);
            const links = await page.evaluate(resultsSelector => {
                const anchors = Array.from(document.querySelectorAll(resultsSelector));
                return anchors.map(anchor => {
                    const title = anchor.textContent.trim();
                    return title;
                });
            }, resultsSelector);


            //GELEN VERİYİ İL İSİMLERİ İLE YAKIT FİYATLARI KARŞILIKLI OLACAK ŞEKİLDE JSON FORMATINA ÇEVİRİYORUZ
            const cleanData = lpgVerisiDuzenle(links);




            await browser.close();
            return cleanData;
        } catch (e) {
            console.log("Aytemiz Lpg sehir çekilemedi!");
        }
    }

    //aytemizAkaryakitfiyatlariCek();

    //aytemizLpgfiyatlariCek();

    let f1 = await aytemizAkaryakitfiyatlariCek();
    let f2 = await aytemizLpgfiyatlariCek();

    //SoilAkaryakitfiyatlariCek(55);

    //SoilLpgfiyatlariCek(55);
    console.log("\nAYTEMİZ\n--------------------------------------------");

    
    fs.writeFileSync("AytemizAkaryakit.txt",JSON.stringify(f1));
    fs.writeFileSync("AytemizLPG.txt",JSON.stringify(f2));

    fuelRepo.addFuelCost("aytemiz",JSON.stringify(f1));
    fuelRepo.addFuelCost("aytemizLpg",JSON.stringify(f2));
    

}


//Json VERİ ALINIYOR - VERİ DÜZENLİ HALE GETİRİLDİ - HER İL TEK TEK ALINIYOR!
GOYakitFiyatlari = async () => {
    const veriDuzenle = (links) => {
        let links2 = links[0].split(" ");
        for (let i = 0; i < links2.length; i++) {
            if (links2[i] == "") {
                links2.splice(i, 1);
                i--;
            } else {
                links2[i] = links2[i].replace("\n", "");
            }

        }
        let cleanData = {};
        let il = links2[0];
        let sayac = 3;

        links2.splice(0, sayac);
        for (let i = 0; i < links2.length; i++) {

            if (links2[i].charCodeAt(0) <= 48 || links2[i].charCodeAt(0) >= 57) {
                links2.splice(i, 1);
                i--;
            }

        }
        cleanData[fromTurkishChar(il)] = links2;
        return cleanData;
    }

    const fiyatlariCek = async (kod) => {
        try {
            const url = `https://www.goyakit.com.tr/guncel-akaryakit-otogaz-fiyatlari`;


            const browser = await puppeteer.launch({
                headless: "new", args: [`--window-size=1920,1080`],
                defaultViewport: {
                    width: 1920,
                    height: 1080
                }
            });
            const page = await browser.newPage();

            await page.goto(url, {
                waitUntil: "networkidle0",
            });

            //tüm şehirleri elde ediyoruz!!
            await page.click("#page > div > div > div.filter-selection.large-12.small-12.columns > div.large-4.small-4.right > a");
            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            await sleep(1000);
            //await page.screenshot({fullPage:true,path:"sadasd.png",type:"png"});
            //1 şehir seçiyoruz 69 il arasından;  #page > div > div > div.filter-selection.large-12.small-12.columns > div.large-4.small-4.right > ul > li:nth-child(5) > a
            await page.click(`#page > div > div > div.filter-selection.large-12.small-12.columns > div.large-4.small-4.right > ul > li:nth-child(${kod}) > a`);



    
            //------------------------------------------------------------------------------------------------------------------------------------
            //buradan  
            const resultsSelector = '#page > div > div > div:nth-child(5) > table > tbody > tr:nth-child(2)';   //** kullanacağın veriyi inceleden bul sağ tıkla, copy menüsüne gel ,"copy selector" butonuna tıklayıp selector ifadesini kopyalamış olursun.
            //bu senin sayfanda bulmasını istediğin etiketlerin binevi yerini tarif eder. biz tüm tablo içeriklerini(tüm şehrin ilçelerini) çekeceğimiz için "tbody" de bitirdik ki tamamı gelsin diye 
            await page.waitForSelector(resultsSelector);
            const links = await page.evaluate(resultsSelector => {
                const anchors = Array.from(document.querySelectorAll(resultsSelector));
                return anchors.map(anchor => {
                    const title = anchor.textContent.trim();
                    return title;
                });
            }, resultsSelector);

            // buraya kadar olan kodlar sabit dökümandan kopyalanmış şekilde kullanılmıştır . puppeteer güncel içerik çekme yöntemidir.
            //------------------------------------------------------------------------------------------------------------------------------------
            //veri düzenleme
            const cleanData = veriDuzenle(links);

            await browser.close();
            return cleanData;
        } catch (e) {
            console.log("GO sehir çekilemedi!");
            
            await fiyatlariCek(kod);
        }
    }

    console.log("\nGO\n--------------------------------------------");
    const GOAkaryakitList = [];

    const sehirGetir = async (i) => {

        let f1 = await fiyatlariCek(i);

        GOAkaryakitList.push(f1);

        console.log(i + "---------- GO akaryakit cekildi");
        
        if(i==62){
            fs.writeFileSync("GOAkaryakit.txt",JSON.stringify(GOAkaryakitList));
            fuelRepo.addFuelCost("go",JSON.stringify(GOAkaryakitList));
        }



    }



    await sehirGetir(1);
    await sehirGetir(2);
    await sehirGetir(3);
    await sehirGetir(4);
    await sehirGetir(5);
    await sehirGetir(6);
    await sehirGetir(7);
    await sehirGetir(8);
    await sehirGetir(9);
    await sehirGetir(10);
    await sehirGetir(11);
    await sehirGetir(12);
    await sehirGetir(13);
    await sehirGetir(14);
    await sehirGetir(15);
    await sehirGetir(16);
    await sehirGetir(17);
    await sehirGetir(18);
    await sehirGetir(19);
    await sehirGetir(20);
    await sehirGetir(21);
    await sehirGetir(22);
    await sehirGetir(23);
    await sehirGetir(24);
    await sehirGetir(25);
    await sehirGetir(26);
    await sehirGetir(27);
    await sehirGetir(28);
    await sehirGetir(29);
    await sehirGetir(30);
    await sehirGetir(31);
    await sehirGetir(32);
    await sehirGetir(33);
    await sehirGetir(34);
    await sehirGetir(35);
    await sehirGetir(36);
    await sehirGetir(37);
    await sehirGetir(38);
    await sehirGetir(39);
    await sehirGetir(40);
    await sehirGetir(41);
    await sehirGetir(42);
    await sehirGetir(43);
    await sehirGetir(44);
    await sehirGetir(45);
    await sehirGetir(46);
    await sehirGetir(47);
    await sehirGetir(48);
    await sehirGetir(49);
    await sehirGetir(50);
    await sehirGetir(51);
    await sehirGetir(52);
    await sehirGetir(53);
    await sehirGetir(54);
    await sehirGetir(55);
    await sehirGetir(56);
    await sehirGetir(57);
    await sehirGetir(58);
    await sehirGetir(59);
    await sehirGetir(60);
    await sehirGetir(61);
    await sehirGetir(62);


}


//Json VERİ ALINIYOR - VERİ DÜZENLİ HALE GETİRİLDİ - HER İL TEK TEK ALINIYOR!
MoilYakitFiyatlari = async () => {
    const veriDuzenle = (links, kod) => {
        let links2 = links[0].split(" ");
        for (let i = 0; i < links2.length; i++) {
            links2[i] = links2[i].replace("\n", "");
            if (links2[i] == " " || links2[i] == "") {
                links2.splice(i, 1);
                i--;
            }

        }
        let il;
        let fiyatDizisi = [];
        let Data = {};
        for (let i = 0; i < links2.length; i++) {
            if (i == 0) {
                il = links2[i];
            } else if (i % 8 == 0) {
                Data[il] = fiyatDizisi;
                il = links2[i];
                fiyatDizisi = [];
            } else if (i == links2.length - 1) {
                fiyatDizisi.push(links2[i]);
                Data[il] = fiyatDizisi;
                fiyatDizisi = [];
            }
            else {
                fiyatDizisi.push(links2[i])
            }

        }
        let cleanData = {};
        if (Data["MERKEZ"] == undefined) {
            let key = Object.keys(Data)[0];
            cleanData[fromTurkishChar(sehirListeleri.MoilSehirListesi[kod])] = Data[key];
        } else {
            cleanData[fromTurkishChar(sehirListeleri.MoilSehirListesi[kod])] = Data["MERKEZ"];
        }
        return cleanData;
    }

    const fiyatlariCek = async (kod) => {
        try {
            const url = `https://www.moil.com.tr/akaryakit-fiyatlari?il=${kod}`;


            const browser = await puppeteer.launch({ headless: "new" });
            const page = await browser.newPage();

            await page.goto(url, {
                waitUntil: "networkidle0",
            });


            //------------------------------------------------------------------------------------------------------------------------------------
            //buradan
            const resultsSelector = 'body > div.cp_form > div > div.distributor_list.table-responsive > table > tbody';   //** kullanacağın veriyi inceleden bul sağ tıkla, copy menüsüne gel ,"copy selector" butonuna tıklayıp selector ifadesini kopyalamış olursun.
            //bu senin sayfanda bulmasını istediğin etiketlerin binevi yerini tarif eder. biz tüm tablo içeriklerini(tüm şehrin ilçelerini) çekeceğimiz için "tbody" de bitirdik ki tamamı gelsin diye 

            await page.waitForSelector(resultsSelector);
            const links = await page.evaluate(resultsSelector => {
                const anchors = Array.from(document.querySelectorAll(resultsSelector));
                return anchors.map(anchor => {
                    const title = anchor.textContent.trim();
                    return title;
                });
            }, resultsSelector);
            // buraya kadar olan kodlar sabit dökümandan kopyalanmış şekilde kullanılmıştır . puppeteer güncel içerik çekme yöntemidir.
            //------------------------------------------------------------------------------------------------------------------------------------

            //Veriyi düzenliyoruz
            const cleanData = veriDuzenle(links, kod);


            //veriyi yazdırıyoruz!


            await browser.close();
            return cleanData;
        } catch (e) {
            console.log("MOİL sehir cekilemedi!");
            await fiyatlariCek(kod);
        }
    }

    //1-81 arası il vardır ve 120 olarak düzce ili işaretlenmiştir

    console.log("\nMOİL\n--------------------------------------------");
    const MOILAkaryakitList = [];

    const sehirGetir = async (i) => {

        let f1 = await fiyatlariCek(i);

        MOILAkaryakitList.push(f1);

        console.log(i + "---------- Moil akaryakit cekildi");
    

        if(i==120){
            fs.writeFileSync("MOILAkaryakit.txt",JSON.stringify(MOILAkaryakitList));
            fuelRepo.addFuelCost("moil",JSON.stringify(MOILAkaryakitList));
        }


    }



    await sehirGetir(1);
    await sehirGetir(2);
    await sehirGetir(3);
    await sehirGetir(4);
    await sehirGetir(5);
    await sehirGetir(6);
    await sehirGetir(7);
    await sehirGetir(8);
    await sehirGetir(9);
    await sehirGetir(10);
    await sehirGetir(11);
    await sehirGetir(12);
    await sehirGetir(13);
    await sehirGetir(14);
    await sehirGetir(15);
    await sehirGetir(16);
    await sehirGetir(17);
    await sehirGetir(18);
    await sehirGetir(19);
    await sehirGetir(20);
    await sehirGetir(21);
    await sehirGetir(22);
    await sehirGetir(23);
    await sehirGetir(24);
    await sehirGetir(25);
    await sehirGetir(26);
    await sehirGetir(27);
    await sehirGetir(28);
    await sehirGetir(29);
    await sehirGetir(30);
    await sehirGetir(31);
    await sehirGetir(32);
    await sehirGetir(33);
    await sehirGetir(34);
    await sehirGetir(35);
    await sehirGetir(36);
    await sehirGetir(37);
    await sehirGetir(38);
    await sehirGetir(39);
    await sehirGetir(40);
    await sehirGetir(41);
    await sehirGetir(42);
    await sehirGetir(43);
    await sehirGetir(44);
    await sehirGetir(45);
    await sehirGetir(46);
    await sehirGetir(47);
    await sehirGetir(48);
    await sehirGetir(49);
    await sehirGetir(50);
    await sehirGetir(51);
    await sehirGetir(52);
    await sehirGetir(53);
    await sehirGetir(54);
    await sehirGetir(55);
    await sehirGetir(56);
    await sehirGetir(57);
    await sehirGetir(58);
    await sehirGetir(59);
    await sehirGetir(60);
    await sehirGetir(61);
    await sehirGetir(62);
    await sehirGetir(63);
    await sehirGetir(64);
    await sehirGetir(65);
    await sehirGetir(66);
    await sehirGetir(67);
    await sehirGetir(68);
    await sehirGetir(69);
    await sehirGetir(70);
    await sehirGetir(71);
    await sehirGetir(72);
    await sehirGetir(73);
    await sehirGetir(74);
    await sehirGetir(75);
    await sehirGetir(76);
    await sehirGetir(77);
    await sehirGetir(78);
    await sehirGetir(79);
    await sehirGetir(80);
    await sehirGetir(81);
    await sehirGetir(120);




}


//Json VERİ ALINIYOR - VERİ DÜZENLİ HALE GETİRİLDİ - HER İL TOPLU ALINIYOR!
OpetYakitFiyatlari = async () => {
    const veriDuzenle = (links) => {
        for (let i = 0; i < links[0].length; i++) {
            links[0] = links[0].replace("İlçe", "-");
            links[0] = links[0].replace("KDV(KDV'li)Kurşunsuz Benzin 95", ",");
            links[0] = links[0].replace("Motorin UltraForce", ",");
            links[0] = links[0].replace("Motorin EcoForce", ",");
            links[0] = links[0].replace("Gazyağı", ",");
            links[0] = links[0].replace("Fuel Oil", ",");
            links[0] = links[0].replace(" Yüksek Kükürtlü Fuel Oil", ",");
            links[0] = links[0].replace(" Kalorifer Yakıtı", ",");
            links[0] = links[0].replace(" TL/L","");
        }
        let links2 = links[0].split("-");
        links2.splice(0, 1);
        let cleanData = {};
        for (let i = 0; i < links2.length; i++) {
            let data = [];
            data = links2[i].split(",");
            let il = fromTurkishChar(data[0]);
            data.splice(0, 1);
            cleanData[il] = data;

        }
        return cleanData;
    }

    const fiyatlariCek = async (kod) => {
        try {
            const url = `https://www.opet.com.tr/akaryakit-fiyatlari`;


            const browser = await puppeteer.launch({ headless: "new" });
            const page = await browser.newPage();

            await page.goto(url, {
                waitUntil: "networkidle0",
            });




            const resultsSelector = `#root > div > div > div > div > div > div.FuelPrice-module_fuelPriceScrolled--1KG > div.FuelPrice-module_fuelPrice--yDZ.box.box-small.w-100 > div > div.table-radius > table > tbody`;   //** kullanacağın veriyi inceleden bul sağ tıkla, copy menüsüne gel ,"copy selector" butonuna tıklayıp selector ifadesini kopyalamış olursun.
            //bu senin sayfanda bulmasını istediğin etiketlerin binevi yerini tarif eder. biz tüm tablo içeriklerini(tüm şehrin ilçelerini) çekeceğimiz için "tbody" de bitirdik ki tamamı gelsin diye 
            await page.waitForSelector(resultsSelector);
            const links = await page.evaluate(resultsSelector => {
                const anchors = Array.from(document.querySelectorAll(resultsSelector));
                return anchors.map(anchor => {
                    const title = anchor.textContent.trim();
                    return title;
                });
            }, resultsSelector);

            // buraya kadar olan kodlar sabit dökümandan kopyalanmış şekilde kullanılmıştır . puppeteer güncel içerik çekme yöntemidir.
            //------------------------------------------------------------------------------------------------------------------------------------
            //Veriyi düzenliyoruz
            const cleanData = veriDuzenle(links);



            //veriyi yazdırıyoruz!


            await browser.close();
            return cleanData;
        } catch (e) {
            console.log("OPET sehirler cekilemedi!");
        }
    }

    //1-82 arası il vardır 
    let f = await fiyatlariCek();
    console.log("\nOPET\n--------------------------------------------");
    

    fs.writeFileSync("OPETAkaryakit.txt",JSON.stringify(f));
    fuelRepo.addFuelCost("opet",JSON.stringify(f));
    


}


//Json VERİ ALINIYOR - VERİ DÜZENLİ HALE GETİRİLDİ - HER İL TEK TEK ALINIYOR!
TPyakitFiyatlari = async () => {
    const veriDuzenle = (links) => {

        let cleanData = {};
        for (let i = 0; i < links[0].length; i++) {
            if (links[0][i] == " ") {
                links[0] = links[0].replace(" ", "");
                i--;
            }
        }
        let data = links[0].split("\n");
        for (let i = 0; i < data.length; i++) {
            if (data[i] == "") {
                data.splice(i, 1);
                i--;
            }

        }
        let il = data[0];
        data.splice(0, 1);
        cleanData[fromTurkishChar(il)] = data;
        return cleanData;
    }

    const Cevir = (text) => {
        var trMap = {
            'çÇ': 'c',
            'ğĞ': 'g',
            'şŞ': 's',
            'üÜ': 'u',
            'ıİ': 'i',
            'öÖ': 'o'
        };
        for (var key in trMap) {
            text = text.replace(new RegExp('[' + key + ']', 'g'), trMap[key]);
        }
        return text.replace(/[^-a-zA-Z0-9\s]+/ig, '')
            .replace(/\s/gi, "-")
            .replace(/[-]+/gi, "-")
            .toLowerCase();

    }
    const fiyatlariCek = async (kod) => {
        try {
            const il = sehirListeleri.TPSehirListesi[kod];
            const url = `https://www.tppd.com.tr/${Cevir(il)}-akaryakit-fiyatlari`;


            const browser = await puppeteer.launch({ headless: "new" });
            const page = await browser.newPage();

            await page.goto(url, {
                waitUntil: "networkidle0",
            });

            const resultsSelector = ` #results > div.responsivetable.pricetable > table > tbody > tr:nth-child(1)`;   //** kullanacağın veriyi inceleden bul sağ tıkla, copy menüsüne gel ,"copy selector" butonuna tıklayıp selector ifadesini kopyalamış olursun.
            //bu senin sayfanda bulmasını istediğin etiketlerin binevi yerini tarif eder. biz tüm tablo içeriklerini(tüm şehrin ilçelerini) çekeceğimiz için "tbody" de bitirdik ki tamamı gelsin diye 
            await page.waitForSelector(resultsSelector);
            const links = await page.evaluate(resultsSelector => {
                const anchors = Array.from(document.querySelectorAll(resultsSelector));
                return anchors.map(anchor => {
                    const title = anchor.textContent.trim();
                    return title;
                });
            }, resultsSelector);

            // buraya kadar olan kodlar sabit dökümandan kopyalanmış şekilde kullanılmıştır . puppeteer güncel içerik çekme yöntemidir.
            //------------------------------------------------------------------------------------------------------------------------------------

            //Veriyi düzenliyoruz
            const cleanData = veriDuzenle(links);



            //veriyi yazdırıyoruz!


            await browser.close();
            return cleanData;
        } catch (e) {
            console.log("TP sehir cekilemedi!");
            await fiyatlariCek(kod);
        }

    }
    console.log("\nTP\n--------------------------------------------");
    //1-82 arası il vardır 
    const TPAkaryakitList = [];

    const sehirGetir = async (i) => {

        let f1 = await fiyatlariCek(i);

        TPAkaryakitList.push(f1);

        console.log(i + "---------- TP akaryakit cekildi");

        if(i==81){
            fs.writeFileSync("TPAkaryakit.txt",JSON.stringify(TPAkaryakitList));
            fuelRepo.addFuelCost("tp",JSON.stringify(TPAkaryakitList));
        }

    }



    await sehirGetir(1);
    await sehirGetir(2);
    await sehirGetir(3);
    await sehirGetir(4);
    await sehirGetir(5);
    await sehirGetir(6);
    await sehirGetir(7);
    await sehirGetir(8);
    await sehirGetir(9);
    await sehirGetir(10);
    await sehirGetir(11);
    await sehirGetir(12);
    await sehirGetir(13);
    await sehirGetir(14);
    await sehirGetir(15);
    await sehirGetir(16);
    await sehirGetir(17);
    await sehirGetir(18);
    await sehirGetir(19);
    await sehirGetir(20);
    await sehirGetir(21);
    await sehirGetir(22);
    await sehirGetir(23);
    await sehirGetir(24);
    await sehirGetir(25);
    await sehirGetir(26);
    await sehirGetir(27);
    await sehirGetir(28);
    await sehirGetir(29);
    await sehirGetir(30);
    await sehirGetir(31);
    await sehirGetir(32);
    await sehirGetir(33);
    await sehirGetir(34);
    await sehirGetir(35);
    await sehirGetir(36);
    await sehirGetir(37);
    await sehirGetir(38);
    await sehirGetir(39);
    await sehirGetir(40);
    await sehirGetir(41);
    await sehirGetir(42);
    await sehirGetir(43);
    await sehirGetir(44);
    await sehirGetir(45);
    await sehirGetir(46);
    await sehirGetir(47);
    await sehirGetir(48);
    await sehirGetir(49);
    await sehirGetir(50);
    await sehirGetir(51);
    await sehirGetir(52);
    await sehirGetir(53);
    await sehirGetir(54);
    await sehirGetir(55);
    await sehirGetir(56);
    await sehirGetir(57);
    await sehirGetir(58);
    await sehirGetir(59);
    await sehirGetir(60);
    await sehirGetir(61);
    await sehirGetir(62);
    await sehirGetir(63);
    await sehirGetir(64);
    await sehirGetir(65);
    await sehirGetir(66);
    await sehirGetir(67);
    await sehirGetir(68);
    await sehirGetir(69);
    await sehirGetir(70);
    await sehirGetir(71);
    await sehirGetir(72);
    await sehirGetir(73);
    await sehirGetir(74);
    await sehirGetir(75);
    await sehirGetir(76);
    await sehirGetir(77);
    await sehirGetir(78);
    await sehirGetir(79);
    await sehirGetir(80);
    await sehirGetir(81);

}


OpetLpgFiyatlari = async () => {
    const OpetLpgfiyatlariCek = async (kod) => {
        try {
            const url = `https://kurumsal.aygaz.com.tr/otogaz/fiyatlar`;


            const browser = await puppeteer.launch({ headless: "new" });
            const page = await browser.newPage();
            //**** waitUntil sayfanın başında loading ekranı varsa yüklenmesini sağlar!!!  Bunu yapmazsan devamındaki verileri alamazsın işlemlerinde hata alırsın dropdown seçme click vs işlemlerde!!!
            await page.goto(url, {
                waitUntil: "networkidle0",
            });

            //dropdown menüden sehir seçiyoruz.        
            await page.click('#fiyatIl');
            //34 ten sonraki iller için 1 fazla inmen lazım çünkü 34 üncü seçenek istanbul-anadolu 35-istanbul-avrupa alduğu için 34 ten sonraki iller 1 kayar.
            for (let i = 0; i < kod; i++) {
                await page.keyboard.press('ArrowDown');
            }
            //await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');


            //ara butonuna basıyoruz.
            await page.click("#container > div.fiyatlarWrapper > div.fiyatLeft > a");

            //verinin gelmesi için süre tanıyoruz sayfaya!!!
            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            await sleep(500);

            //hata varmı falan diye işlemin ekran resmini lıp bakabiliriz!!!
            //await page.screenshot({fullPage:true,path:"sadasd.png",type:"png"});

            const resultsSelector = '#resultPrice';

            const links = await page.evaluate(resultsSelector => {
                const anchors = Array.from(document.querySelectorAll(resultsSelector));
                return anchors.map(anchor => {
                    const title = anchor.textContent.trim();
                    return title;
                });
            }, resultsSelector);
            let cleanData = {};
            cleanData[fromTurkishChar(sehirListeleri.OpetLpgSehirListesi[kod+1])] = links[0];


            await browser.close();
            return cleanData;
        } catch (e) {
            await OpetLpgfiyatlariCek(kod);
        }
    }
    
    const OpetLpgList = [];
    console.log("\nOPET LPG\n--------------------------------------------");

    const sehirGetir = async (i) => {


        let f2 = await OpetLpgfiyatlariCek(i);

        OpetLpgList.push(f2);
        console.log(i + "---------- Opet LPG cekildi");

        
        if(i==81){
            fs.writeFileSync("OpetLPG.txt",JSON.stringify(OpetLpgList));
            fuelRepo.addFuelCost("opetLpg",JSON.stringify(OpetLpgList));
        }

    }

    await sehirGetir(0);
    await sehirGetir(1);
    await sehirGetir(2);
    await sehirGetir(3);
    await sehirGetir(4);
    await sehirGetir(5);
    await sehirGetir(6);
    await sehirGetir(7);
    await sehirGetir(8);
    await sehirGetir(9);
    await sehirGetir(10);
    await sehirGetir(11);
    await sehirGetir(12);
    await sehirGetir(13);
    await sehirGetir(14);
    await sehirGetir(15);
    await sehirGetir(16);
    await sehirGetir(17);
    await sehirGetir(18);
    await sehirGetir(19);
    await sehirGetir(20);
    await sehirGetir(21);
    await sehirGetir(22);
    await sehirGetir(23);
    await sehirGetir(24);
    await sehirGetir(25);
    await sehirGetir(26);
    await sehirGetir(27);
    await sehirGetir(28);
    await sehirGetir(29);
    await sehirGetir(30);
    await sehirGetir(31);
    await sehirGetir(32);
    await sehirGetir(33);
    await sehirGetir(34);
    await sehirGetir(35);
    await sehirGetir(36);
    await sehirGetir(37);
    await sehirGetir(38);
    await sehirGetir(39);
    await sehirGetir(40);
    await sehirGetir(41);
    await sehirGetir(42);
    await sehirGetir(43);
    await sehirGetir(44);
    await sehirGetir(45);
    await sehirGetir(46);
    await sehirGetir(47);
    await sehirGetir(48);
    await sehirGetir(49);
    await sehirGetir(50);
    await sehirGetir(51);
    await sehirGetir(52);
    await sehirGetir(53);
    await sehirGetir(54);
    await sehirGetir(55);
    await sehirGetir(56);
    await sehirGetir(57);
    await sehirGetir(58);
    await sehirGetir(59);
    await sehirGetir(60);
    await sehirGetir(61);
    await sehirGetir(62);
    await sehirGetir(63);
    await sehirGetir(64);
    await sehirGetir(65);
    await sehirGetir(66);
    await sehirGetir(67);
    await sehirGetir(68);
    await sehirGetir(69);
    await sehirGetir(70);
    await sehirGetir(71);
    await sehirGetir(72);
    await sehirGetir(73);
    await sehirGetir(74);
    await sehirGetir(75);
    await sehirGetir(76);
    await sehirGetir(77);
    await sehirGetir(78);
    await sehirGetir(79);
    await sehirGetir(80);
    await sehirGetir(81);
 


}

TumAkaryakitFiyatlariCek=async()=>{
    /*
    await petrolOfisiYakitFiyatlari();
    console.log("-------------------PO bitti!------------");
    await aytemizYakitFiyatlari();
    console.log("-------------------Aytemiz bitti!------------"); 
    await OpetYakitFiyatlari();
    console.log("-------------------OPET bitti!------------");*/


    
    await ShellYakitFiyatlari();   
    console.log("-------------------SHELL bitti!------------");
    /*await GOYakitFiyatlari();
    console.log("-------------------GO bitti!------------");
    await MoilYakitFiyatlari(); 
    console.log("-------------------MOİL bitti!------------");
    await TPyakitFiyatlari();
    console.log("-------------------TP bitti!------------");
    await SoilAkaryakitFiyatlari();
    console.log("-------------------SOİL Akaryakit bitti!------------");
    await SoilLpgFiyatlari();
    console.log("-------------------SOİL LPG bitti!------------");*/

    await OpetLpgFiyatlari();
    console.log("-------------------Opet LPG bitti!------------");
    
}

module.exports=TumAkaryakitFiyatlariCek;