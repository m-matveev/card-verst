var $ = function (el) {
    var elements = document.querySelectorAll(el);

    if (elements.length === 1) {
        return elements[0];
    }

    return elements;
};

function isDigitKeyCode(keyCode) {
    return (keyCode >= 49 && keyCode <= 57)
}

function getKeyCodeFromEvent(e) {
    return e.keyCode || e.which;
}

function cardChangeListener(e){
    var value = e.target.value.replace(/[^0-9]/g, '');

        // определяем платежную систему
        Array.prototype.forEach.call($('.card_type_icon'), function(toHide) {
            toHide.classList.remove('hidden');
            toHide.classList.remove('detected');
        });

        Object.keys(paySysPatterns).forEach(function (pattern) {
            var regex = new RegExp(pattern);
            if (regex.test(value)) {

                Array.prototype.forEach.call($('.card_type_icon'), function(toHide) {
//                $('.card_type_icon').forEach(function (toHide) {
                    toHide.classList.add('hidden');
                });

                $('.card_type_' + paySysPatterns[pattern]).classList.remove('hidden');
                $('.card_type_' + paySysPatterns[pattern]).classList.add('detected');
            }
        });

        // определяем банк - эмитент
        $('.card_type_detected').className = $('.card_type_detected').className.replace(/bank-card_logo_name_(.*)/, '');
        $('.card-left').className = $('.card-left').className.replace(/card-left_(.*)/, '');

        Object.keys(bankPatterns).forEach(function (pattern) {
            var regex = new RegExp('^' + pattern);
            if (regex.test(value)) {
                // console.log(bankPatterns[pattern] + ' detected');
                $('.card_type_detected').classList.remove('hidden');
                $('.card_type_detected').classList.add('bank-card_logo_name_' + bankPatterns[pattern]);
                $('.card-left').classList.add('card-left_' + bankPatterns[pattern]);
            }
        });

        // перекидываем каретку на ММ/ГГ
        if ((value.length === 16 || value.length === 19) && isDigitKeyCode(getKeyCodeFromEvent(e))) {
            $('#card_mm').focus();
        }
}

document.addEventListener('DOMContentLoaded', function () {
    $('#payment_form').addEventListener('submit', function (e) {
        e.preventDefault();
        $('#submit_btn').click();
    });
    
    ['keyup', 'change'].map(function(eName) {
        $('#card_num').addEventListener(eName, function (e) {
            cardChangeListener(e);
        });
    });

    // перекидываем каретку на ГГ когда заполнен ММ
    $('#card_mm').addEventListener('keyup', function (e) {
        if (e.target.value.length === 2 && isDigitKeyCode(getKeyCodeFromEvent(e))) {
            $('#card_yy').focus();
        }
    });

    // перекидываем каретку на CVC когда заполнен ГГ
    $('#card_yy').addEventListener('keyup', function (e) {
        if (e.target.value.length === 2 && isDigitKeyCode(getKeyCodeFromEvent(e))) {
            $('#card_cvc').focus();
        }
    });

    // фокус на сабмит после cvc
    $('#card_cvc').addEventListener('keyup', function (e) {
        if (e.target.value.length === 3 && isDigitKeyCode(getKeyCodeFromEvent(e))) {
            $('#submit_btn').focus();
        }
    });

    // отправка формы по нажатию enter
    $('body').addEventListener('keyup', function (e) {
        var key = e.which || e.keyCode;
        if (key === 13 && e.target.id !== 'submit_btn') {
            $('#submit_btn').click();
        }
    });


    $('#submit_btn').addEventListener('click', function (e) {
        // console.log('submit form function call, validate here', e);

        var num = $('#card_num').value.replace(/[^0-9]/g, '');
        var month = $('#card_mm').value.replace(/[^0-9]/g, '');
        var year = $('#card_yy').value.replace(/[^0-9]/g, '');
        var cvv = $('#card_cvc').value.replace(/[^0-9]/g, '');

        if (totalCheck(num, month, year, cvv)) {
            window.parent.postMessage('valid_card_filled', '*');
            sendForm(num, month, year, cvv);
        }
    });

    Array.prototype.forEach.call($('input'), function(element) {
        // клик на инпут, снятие класса ошибки и добавление класса подсветки
        element.addEventListener("focus", function (e) {
            e.target.parentElement.parentElement.classList.remove('error');
            e.target.parentElement.parentElement.classList.add('active');
        });

        // снятие подсветки при потере фокуса
        element.addEventListener("blur", function (e) {
            e.target.parentElement.parentElement.classList.remove('active');
        });
    });

    // фокус на номер карты
    $('#card_num').focus();
        
    vanillaTextMask.maskInput({
        inputElement: $('#card_num'),
        guide: false,
        mask: [/[0-9]/,/[0-9]/,/[0-9]/,/[0-9]/, ' ', /[0-9]/,/[0-9]/,/[0-9]/,/[0-9]/, ' ', /[0-9]/, /[0-9]/, /[0-9]/,/[0-9]/,' ', /[0-9]/, /[0-9]/, /[0-9]/,/[0-9]/,/[0-9]/,/[0-9]/,/[0-9]/]
    });
    
    vanillaTextMask.maskInput({
        inputElement: $('#card_mm'),
        guide: false,
        mask: [/[0-9]/,/[0-9]/]
    });
  
    vanillaTextMask.maskInput({
        inputElement: $('#card_yy'),
        guide: false,
        mask: [/[0-9]/,/[0-9]/]
    });

});

/**
 * Проверка введенных данных на валидность
 * @param num
 * @param month
 * @param year
 * @param cvv
 * @returns {boolean}
 */
function totalCheck(num, month, year, cvv) {
    /* card num check */
    if (!(num.length >= 16 && num.length <= 19 && luhnChk(num))) {
        $('.card-number').classList.add('error');
    }

    /* until check */
    if (!(month.length === 2 && month <= 12)) {
        $('.card-valid').classList.add('error');
    }

    var today = new Date();
    var until = new Date("20" + year, month);

    if (!(month.length === 2 && month <= 12 && year.length === 2 && (until.valueOf() - today.valueOf()) > 0)) {
        $('.card-valid').classList.add('error');
    }

    /** cvv check **/
    if (cvv.length !== 3) {
        $('.card-cvc').classList.add('error');
    }

    return $('.error').length === 0;
}

/**
 * Проверка валидности номера карты
 * @param luhn
 * @returns {boolean}
 */
function luhnChk(luhn) {
    var len = luhn.length,
        mul = 0,
        prodArr = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 2, 4, 6, 8, 1, 3, 5, 7, 9]],
        sum = 0;

    while (len--) {
        sum += prodArr[mul][parseInt(luhn.charAt(len), 10)];
        mul ^= 1;
    }

    return sum % 10 === 0 && sum > 0;
};

/**
 * Установка ссылки на оферту
 * @param link
 */
function setLinkToOferta(link) {
    $('#linkToOferta').href = link;
}

var paySysPatterns = {
    '^2': "mir",
    '^4': "visa",
    '^5[1-5]': "mastercard",
    '^(50|56|57|58|63|67)': "maestro"
};

var bankPatterns = {
    424436: "akbars",
    424440: "akbars",
    424438: "akbars",
    424437: "akbars",
    424439: "akbars",
    677088: "akbars",
    410243: "alfabank",
    410244: "alfabank",
    410245: "alfabank",
    410246: "alfabank",
    410247: "alfabank",
    410584: "alfabank",
    415400: "alfabank",
    415428: "alfabank",
    415429: "alfabank",
    415481: "alfabank",
    415482: "alfabank",
    419540: "alfabank",
    420102: "alfabank",
    420103: "alfabank",
    420104: "alfabank",
    420105: "alfabank",
    420106: "alfabank",
    420108: "alfabank",
    421118: "alfabank",
    422605: "alfabank",
    423719: "alfabank",
    427218: "alfabank",
    427714: "alfabank",
    428804: "alfabank",
    428905: "alfabank",
    428906: "alfabank",
    431416: "alfabank",
    431417: "alfabank",
    431727: "alfabank",
    434135: "alfabank",
    438138: "alfabank",
    438139: "alfabank",
    438140: "alfabank",
    439000: "alfabank",
    439077: "alfabank",
    440237: "alfabank",
    458280: "alfabank",
    458410: "alfabank",
    458411: "alfabank",
    458450: "alfabank",
    458521: "alfabank",
    477932: "alfabank",
    477964: "alfabank",
    478752: "alfabank",
    479004: "alfabank",
    479087: "alfabank",
    510126: "alfabank",
    521178: "alfabank",
    530827: "alfabank",
    543259: "alfabank",
    548601: "alfabank",
    548655: "alfabank",
    548673: "alfabank",
    548674: "alfabank",
    552175: "alfabank",
    555947: "alfabank",
    555957: "alfabank",
    555949: "alfabank",
    403896: "avangard",
    403897: "avangard",
    403898: "avangard",
    404114: "avangard",
    419163: "avangard",
    522223: "avangard",
    522224: "avangard",
    419149: "az-to-bank",
    419150: "az-to-bank",
    419151: "az-to-bank",
    419152: "az-to-bank",
    419153: "az-to-bank",
    458488: "az-to-bank",
    458489: "az-to-bank",
    458490: "az-to-bank",
    532947: "az-to-bank",
    428247: "baltinvestbank",
    428248: "baltinvestbank",
    428249: "baltinvestbank",
    413064: "bank-moskvi",
    424646: "bank-moskvi",
    427275: "bank-moskvi",
    427726: "bank-moskvi",
    429158: "bank-moskvi",
    431336: "bank-moskvi",
    465206: "bank-moskvi",
    465207: "bank-moskvi",
    465208: "bank-moskvi",
    465218: "bank-moskvi",
    541715: "bank-moskvi",
    402538: "binbank",
    425175: "binbank",
    433920: "binbank",
    518961: "binbank",
    465008: "binbank",
    400648: "center-invest",
    411717: "center-invest",
    411718: "center-invest",
    430312: "center-invest",
    430314: "center-invest",
    458527: "center-invest",
    512762: "citibank",
    515854: "citibank",
    520306: "citibank",
    525689: "citibank",
    527594: "citibank",
    531809: "citibank",
    532974: "citibank",
    533201: "citibank",
    533681: "citibank",
    539726: "citibank",
    540788: "citibank",
    545182: "citibank",
    552573: "citibank",
    555057: "citibank",
    555058: "citibank",
    408373: "crediteuropebank",
    411647: "crediteuropebank",
    411648: "crediteuropebank",
    411649: "crediteuropebank",
    432158: "crediteuropebank",
    512273: "crediteuropebank",
    520957: "crediteuropebank",
    520993: "crediteuropebank",
    521144: "crediteuropebank",
    521830: "crediteuropebank",
    525991: "crediteuropebank",
    531034: "crediteuropebank",
    532315: "crediteuropebank",
    541450: "crediteuropebank",
    547550: "crediteuropebank",
    557056: "crediteuropebank",
    557057: "crediteuropebank",
    676586: "crediteuropebank",
    404160: "expobank",
    422081: "expobank",
    427754: "expobank",
    487432: "expobank",
    487433: "expobank",
    487434: "expobank",
    487435: "expobank",
    546855: "expobank",
    554834: "expobank",
    425534: "express-bank",
    425535: "express-bank",
    443886: "express-bank",
    443887: "express-bank",
    443888: "express-bank",
    444094: "express-bank",
    429907: "finservice",
    429908: "finservice",
    403828: "fnp-bank",
    403829: "fnp-bank",
    403830: "fnp-bank",
    478488: "fnp-bank",
    404270: "gasprom",
    487415: "gasprom",
    514082: "gasprom",
    518228: "gasprom",
    518373: "gasprom",
    518704: "gasprom",
    518816: "gasprom",
    518902: "gasprom",
    521155: "gasprom",
    522193: "gasprom",
    522477: "gasprom",
    522826: "gasprom",
    522988: "gasprom",
    522989: "gasprom",
    525740: "gasprom",
    525784: "gasprom",
    525833: "gasprom",
    526483: "gasprom",
    529278: "gasprom",
    530114: "gasprom",
    530993: "gasprom",
    531305: "gasprom",
    532684: "gasprom",
    534130: "gasprom",
    534196: "gasprom",
    536995: "gasprom",
    539839: "gasprom",
    540664: "gasprom",
    542255: "gasprom",
    543672: "gasprom",
    543724: "gasprom",
    543762: "gasprom",
    544026: "gasprom",
    544561: "gasprom",
    545101: "gasprom",
    547348: "gasprom",
    548027: "gasprom",
    548999: "gasprom",
    549000: "gasprom",
    549098: "gasprom",
    549600: "gasprom",
    552702: "gasprom",
    556052: "gasprom",
    558355: "gasprom",
    676454: "gasprom",
    676990: "gasprom",
    677484: "gasprom",
    677585: "gasprom",
    439245: "globex",
    406726: "globex",
    424547: "globex",
    424548: "globex",
    445433: "homecredit",
    445434: "homecredit",
    445435: "homecredit",
    472445: "homecredit",
    522199: "homecredit",
    525933: "homecredit",
    536511: "homecredit",
    545762: "homecredit",
    548745: "homecredit",
    557734: "homecredit",
    446098: "homecredit",
    406180: "intercommerz",
    406181: "intercommerz",
    406182: "intercommerz",
    460052: "intercommerz",
    510170: "intercommerz",
    402578: "inteza",
    421169: "inteza",
    421170: "inteza",
    421171: "inteza",
    484891: "inteza",
    406777: "jugra",
    406778: "jugra",
    406780: "jugra",
    406781: "jugra",
    549966: "jugra",
    558385: "jugra",
    405992: "leto-bank",
    515785: "mdm",
    518586: "mdm",
    518788: "mdm",
    518876: "mdm",
    520328: "mdm",
    524860: "mdm",
    524862: "mdm",
    525742: "mdm",
    525744: "mdm",
    527448: "mdm",
    527450: "mdm",
    531425: "mdm",
    532835: "mdm",
    533614: "mdm",
    539036: "mdm",
    539600: "mdm",
    540194: "mdm",
    540455: "mdm",
    540642: "mdm",
    541152: "mdm",
    541294: "mdm",
    541587: "mdm",
    542504: "mdm",
    543038: "mdm",
    543366: "mdm",
    544117: "mdm",
    547243: "mdm",
    547377: "mdm",
    547801: "mdm",
    548092: "mdm",
    548265: "mdm",
    548270: "mdm",
    549349: "mdm",
    549512: "mdm",
    549523: "mdm",
    550025: "mdm",
    552866: "mdm",
    554372: "mdm",
    554373: "mdm",
    557976: "mdm",
    558625: "mdm",
    558636: "mdm",
    676428: "mdm",
    676934: "mdm",
    676947: "mdm",
    676998: "mdm",
    677058: "mdm",
    677275: "mdm",
    677276: "mdm",
    677358: "mdm",
    677406: "mdm",
    677505: "mdm",
    430112: "mfk",
    430113: "mfk",
    430114: "mfk",
    445636: "mfk",
    445637: "mfk",
    458449: "mfk",
    402326: "mib",
    402327: "mib",
    402328: "mib",
    402549: "mib",
    472480: "mib",
    480938: "mib",
    515587: "mib",
    557071: "mib",
    557072: "mib",
    515770: "moscredbank",
    676967: "moscredbank",
    552680: "moscredbank",
    543211: "moscredbank",
    542033: "moscredbank",
    521801: "moscredbank",
    532184: "moscredbank",
    404204: "mts-bank",
    404224: "mts-bank",
    404266: "mts-bank",
    404267: "mts-bank",
    404268: "mts-bank",
    404269: "mts-bank",
    406356: "mts-bank",
    517955: "mts-bank",
    533736: "mts-bank",
    540616: "mts-bank",
    541435: "mts-bank",
    550583: "mts-bank",
    402457: "novikombank",
    402909: "novikombank",
    402910: "novikombank",
    402911: "novikombank",
    458559: "novikombank",
    471436: "novikombank",
    532130: "openrocket",
    406790: "otkritie",
    406791: "otkritie",
    406792: "otkritie",
    409755: "otkritie",
    409756: "otkritie",
    417676: "otkritie",
    425656: "otkritie",
    437351: "otkritie",
    446065: "otkritie",
    474159: "otkritie",
    530183: "otkritie",
    530403: "otkritie",
    531674: "otkritie",
    532301: "otkritie",
    539714: "otkritie",
    544218: "otkritie",
    544962: "otkritie",
    549024: "otkritie",
    549025: "otkritie",
    558620: "otkritie",
    670518: "otkritie",
    676231: "otkritie",
    405844: "probusiness",
    405845: "probusiness",
    405846: "probusiness",
    405847: "probusiness",
    413229: "probusiness",
    515848: "promsvyazbank",
    516473: "promsvyazbank",
    518486: "promsvyazbank",
    518946: "promsvyazbank",
    518951: "promsvyazbank",
    518970: "promsvyazbank",
    518977: "promsvyazbank",
    518981: "promsvyazbank",
    520085: "promsvyazbank",
    520088: "promsvyazbank",
    520373: "promsvyazbank",
    521124: "promsvyazbank",
    525494: "promsvyazbank",
    526280: "promsvyazbank",
    528701: "promsvyazbank",
    529160: "promsvyazbank",
    530441: "promsvyazbank",
    531534: "promsvyazbank",
    532421: "promsvyazbank",
    539621: "promsvyazbank",
    539704: "promsvyazbank",
    539861: "promsvyazbank",
    541269: "promsvyazbank",
    542340: "promsvyazbank",
    543874: "promsvyazbank",
    544800: "promsvyazbank",
    545350: "promsvyazbank",
    546766: "promsvyazbank",
    547329: "promsvyazbank",
    548172: "promsvyazbank",
    548429: "promsvyazbank",
    549425: "promsvyazbank",
    549439: "promsvyazbank",
    549524: "promsvyazbank",
    554279: "promsvyazbank",
    554759: "promsvyazbank",
    554781: "promsvyazbank",
    556046: "promsvyazbank",
    557981: "promsvyazbank",
    558254: "promsvyazbank",
    558268: "promsvyazbank",
    558516: "promsvyazbank",
    558672: "promsvyazbank",
    670508: "promsvyazbank",
    670583: "promsvyazbank",
    670611: "promsvyazbank",
    670654: "promsvyazbank",
    670661: "promsvyazbank",
    676444: "promsvyazbank",
    677263: "promsvyazbank",
    677356: "promsvyazbank",
    677370: "promsvyazbank",
    677371: "promsvyazbank",
    677372: "promsvyazbank",
    677461: "promsvyazbank",
    677462: "promsvyazbank",
    677506: "promsvyazbank",
    515876: "raiffeisen",
    533594: "raiffeisen",
    533616: "raiffeisen",
    536392: "raiffeisen",
    510070: "raiffeisen",
    545115: "raiffeisen",
    528809: "raiffeisen",
    528808: "raiffeisen",
    528053: "raiffeisen",
    547613: "raiffeisen",
    544237: "raiffeisen",
    542772: "raiffeisen",
    558273: "raiffeisen",
    510069: "raiffeisen",
    676625: "raiffeisen",
    508406: "raiffeisen",
    530867: "raiffeisen",
    553496: "raiffeisen",
    558536: "raiffeisen",
    462729: "raiffeisen",
    485078: "rocketbank",
    404862: "rosbank",
    404890: "rosbank",
    404892: "rosbank",
    406767: "rosbank",
    407564: "rosbank",
    412519: "rosbank",
    416956: "rosbank",
    423169: "rosbank",
    425153: "rosbank",
    427715: "rosbank",
    432638: "rosbank",
    438933: "rosbank",
    438970: "rosbank",
    438971: "rosbank",
    440503: "rosbank",
    440505: "rosbank",
    440540: "rosbank",
    440541: "rosbank",
    459937: "rosbank",
    474218: "rosbank",
    477908: "rosbank",
    477986: "rosbank",
    499932: "rosbank",
    499966: "rosbank",
    515605: "rosbank",
    518079: "rosbank",
    518642: "rosbank",
    518882: "rosbank",
    526462: "rosbank",
    528933: "rosbank",
    531222: "rosbank",
    534251: "rosbank",
    540035: "rosbank",
    541903: "rosbank",
    549475: "rosbank",
    554761: "rosbank",
    554782: "rosbank",
    555079: "rosbank",
    558673: "rosbank",
    426809: "rossiya",
    426812: "rossiya",
    419905: "rossiya",
    426814: "rossiya",
    426813: "rossiya",
    426815: "rossiya",
    426810: "rossiya",
    458722: "rossiya",
    426811: "rossiya",
    458723: "rossiya",
    430709: "rossiya",
    430708: "rossiya",
    534162: "rsb",
    536409: "rsb",
    525446: "rsb",
    547601: "rsb",
    549715: "rsb",
    422608: "rsb",
    416982: "rgs",
    416983: "rgs",
    416984: "rgs",
    431359: "rgs",
    472489: "rgs",
    521172: "rgs",
    526818: "rgs",
    677189: "rgs",
    417250: "russtandart",
    417251: "russtandart",
    417252: "russtandart",
    417253: "russtandart",
    417254: "russtandart",
    417291: "russtandart",
    510047: "russtandart",
    510092: "russtandart",
    513691: "russtandart",
    533469: "russtandart",
    536401: "russtandart",
    542048: "russtandart",
    545160: "russtandart",
    676565: "russtandart",
    639002: "sberbank",
    426343: "sberbank",
    427400: "sberbank",
    427401: "sberbank",
    427402: "sberbank",
    427403: "sberbank",
    427404: "sberbank",
    427405: "sberbank",
    427406: "sberbank",
    427407: "sberbank",
    427408: "sberbank",
    427409: "sberbank",
    427410: "sberbank",
    427411: "sberbank",
    427412: "sberbank",
    427413: "sberbank",
    427414: "sberbank",
    427416: "sberbank",
    427417: "sberbank",
    427418: "sberbank",
    427419: "sberbank",
    427420: "sberbank",
    427421: "sberbank",
    427422: "sberbank",
    427423: "sberbank",
    427424: "sberbank",
    427425: "sberbank",
    427426: "sberbank",
    427427: "sberbank",
    427428: "sberbank",
    427429: "sberbank",
    427430: "sberbank",
    427431: "sberbank",
    427433: "sberbank",
    427434: "sberbank",
    427435: "sberbank",
    427437: "sberbank",
    427438: "sberbank",
    427439: "sberbank",
    427440: "sberbank",
    427441: "sberbank",
    427442: "sberbank",
    427443: "sberbank",
    427444: "sberbank",
    427445: "sberbank",
    427446: "sberbank",
    427447: "sberbank",
    427448: "sberbank",
    427449: "sberbank",
    427450: "sberbank",
    427451: "sberbank",
    427453: "sberbank",
    427454: "sberbank",
    427455: "sberbank",
    427456: "sberbank",
    427457: "sberbank",
    427458: "sberbank",
    427459: "sberbank",
    427460: "sberbank",
    427461: "sberbank",
    427462: "sberbank",
    427463: "sberbank",
    427465: "sberbank",
    427466: "sberbank",
    427467: "sberbank",
    427468: "sberbank",
    427469: "sberbank",
    427470: "sberbank",
    427471: "sberbank",
    427472: "sberbank",
    427473: "sberbank",
    427474: "sberbank",
    427475: "sberbank",
    427476: "sberbank",
    427477: "sberbank",
    427491: "sberbank",
    427499: "sberbank",
    427600: "sberbank",
    427601: "sberbank",
    427602: "sberbank",
    427603: "sberbank",
    427604: "sberbank",
    427605: "sberbank",
    427606: "sberbank",
    427607: "sberbank",
    427608: "sberbank",
    427609: "sberbank",
    427610: "sberbank",
    427611: "sberbank",
    427612: "sberbank",
    427613: "sberbank",
    427614: "sberbank",
    427615: "sberbank",
    427616: "sberbank",
    427617: "sberbank",
    427618: "sberbank",
    427619: "sberbank",
    427620: "sberbank",
    427621: "sberbank",
    427622: "sberbank",
    427624: "sberbank",
    427625: "sberbank",
    427626: "sberbank",
    427627: "sberbank",
    427628: "sberbank",
    427629: "sberbank",
    427630: "sberbank",
    427631: "sberbank",
    427632: "sberbank",
    427633: "sberbank",
    427634: "sberbank",
    427635: "sberbank",
    427636: "sberbank",
    427637: "sberbank",
    427638: "sberbank",
    427639: "sberbank",
    427640: "sberbank",
    427641: "sberbank",
    427642: "sberbank",
    427643: "sberbank",
    427644: "sberbank",
    427645: "sberbank",
    427646: "sberbank",
    427647: "sberbank",
    427648: "sberbank",
    427649: "sberbank",
    427650: "sberbank",
    427651: "sberbank",
    427652: "sberbank",
    427653: "sberbank",
    427654: "sberbank",
    427655: "sberbank",
    427656: "sberbank",
    427657: "sberbank",
    427658: "sberbank",
    427659: "sberbank",
    427660: "sberbank",
    427661: "sberbank",
    427662: "sberbank",
    427663: "sberbank",
    427664: "sberbank",
    427665: "sberbank",
    427666: "sberbank",
    427667: "sberbank",
    427668: "sberbank",
    427669: "sberbank",
    427670: "sberbank",
    427671: "sberbank",
    427672: "sberbank",
    427673: "sberbank",
    427674: "sberbank",
    427675: "sberbank",
    427676: "sberbank",
    427677: "sberbank",
    427678: "sberbank",
    427679: "sberbank",
    427680: "sberbank",
    427681: "sberbank",
    427684: "sberbank",
    427685: "sberbank",
    427686: "sberbank",
    427687: "sberbank",
    427688: "sberbank",
    427689: "sberbank",
    427690: "sberbank",
    427692: "sberbank",
    427693: "sberbank",
    427694: "sberbank",
    427695: "sberbank",
    427696: "sberbank",
    427697: "sberbank",
    427900: "sberbank",
    427902: "sberbank",
    427903: "sberbank",
    427904: "sberbank",
    427905: "sberbank",
    427906: "sberbank",
    427907: "sberbank",
    427908: "sberbank",
    427910: "sberbank",
    427911: "sberbank",
    427912: "sberbank",
    427913: "sberbank",
    427914: "sberbank",
    427915: "sberbank",
    427916: "sberbank",
    427917: "sberbank",
    427918: "sberbank",
    427919: "sberbank",
    427920: "sberbank",
    427921: "sberbank",
    427922: "sberbank",
    427923: "sberbank",
    427924: "sberbank",
    427925: "sberbank",
    427927: "sberbank",
    427928: "sberbank",
    427929: "sberbank",
    427930: "sberbank",
    427931: "sberbank",
    427932: "sberbank",
    427933: "sberbank",
    427934: "sberbank",
    427935: "sberbank",
    427936: "sberbank",
    427937: "sberbank",
    427938: "sberbank",
    427939: "sberbank",
    427940: "sberbank",
    427941: "sberbank",
    427942: "sberbank",
    427943: "sberbank",
    427944: "sberbank",
    427945: "sberbank",
    427946: "sberbank",
    427947: "sberbank",
    427948: "sberbank",
    427949: "sberbank",
    427950: "sberbank",
    427951: "sberbank",
    427952: "sberbank",
    427953: "sberbank",
    427954: "sberbank",
    427955: "sberbank",
    427956: "sberbank",
    427957: "sberbank",
    427958: "sberbank",
    427960: "sberbank",
    427961: "sberbank",
    427962: "sberbank",
    427963: "sberbank",
    427964: "sberbank",
    427965: "sberbank",
    427966: "sberbank",
    427967: "sberbank",
    427968: "sberbank",
    427969: "sberbank",
    427970: "sberbank",
    427971: "sberbank",
    427972: "sberbank",
    427973: "sberbank",
    427974: "sberbank",
    427975: "sberbank",
    427976: "sberbank",
    427977: "sberbank",
    427978: "sberbank",
    427979: "sberbank",
    427980: "sberbank",
    427982: "sberbank",
    427983: "sberbank",
    427984: "sberbank",
    427986: "sberbank",
    427988: "sberbank",
    427989: "sberbank",
    427990: "sberbank",
    427991: "sberbank",
    427992: "sberbank",
    427993: "sberbank",
    427994: "sberbank",
    427995: "sberbank",
    427996: "sberbank",
    427997: "sberbank",
    427998: "sberbank",
    427999: "sberbank",
    437435: "sberbank",
    437985: "sberbank",
    481776: "sberbank",
    515842: "sberbank",
    531310: "sberbank",
    533669: "sberbank",
    545037: "sberbank",
    546902: "sberbank",
    546903: "sberbank",
    546904: "sberbank",
    546905: "sberbank",
    546906: "sberbank",
    546907: "sberbank",
    546908: "sberbank",
    546909: "sberbank",
    546910: "sberbank",
    546911: "sberbank",
    546912: "sberbank",
    546913: "sberbank",
    546916: "sberbank",
    546917: "sberbank",
    546918: "sberbank",
    546920: "sberbank",
    546922: "sberbank",
    546925: "sberbank",
    546926: "sberbank",
    546927: "sberbank",
    546928: "sberbank",
    546930: "sberbank",
    546931: "sberbank",
    546935: "sberbank",
    546936: "sberbank",
    546937: "sberbank",
    546938: "sberbank",
    546939: "sberbank",
    546940: "sberbank",
    546941: "sberbank",
    546942: "sberbank",
    546943: "sberbank",
    546944: "sberbank",
    546945: "sberbank",
    546947: "sberbank",
    546948: "sberbank",
    546949: "sberbank",
    546951: "sberbank",
    546952: "sberbank",
    546953: "sberbank",
    546954: "sberbank",
    546955: "sberbank",
    546956: "sberbank",
    546959: "sberbank",
    546960: "sberbank",
    546961: "sberbank",
    546962: "sberbank",
    546963: "sberbank",
    546964: "sberbank",
    546966: "sberbank",
    546967: "sberbank",
    546968: "sberbank",
    546969: "sberbank",
    546970: "sberbank",
    546972: "sberbank",
    546974: "sberbank",
    546975: "sberbank",
    546977: "sberbank",
    546999: "sberbank",
    547927: "sberbank",
    547931: "sberbank",
    547932: "sberbank",
    547947: "sberbank",
    547952: "sberbank",
    547955: "sberbank",
    547961: "sberbank",
    548401: "sberbank",
    548402: "sberbank",
    548407: "sberbank",
    548410: "sberbank",
    548412: "sberbank",
    548413: "sberbank",
    548416: "sberbank",
    548420: "sberbank",
    548425: "sberbank",
    548426: "sberbank",
    548427: "sberbank",
    548428: "sberbank",
    548430: "sberbank",
    548435: "sberbank",
    548440: "sberbank",
    548442: "sberbank",
    548443: "sberbank",
    548444: "sberbank",
    548445: "sberbank",
    548447: "sberbank",
    548448: "sberbank",
    548449: "sberbank",
    548450: "sberbank",
    548452: "sberbank",
    548454: "sberbank",
    548455: "sberbank",
    548459: "sberbank",
    548460: "sberbank",
    548461: "sberbank",
    548462: "sberbank",
    548463: "sberbank",
    548464: "sberbank",
    548466: "sberbank",
    548469: "sberbank",
    548470: "sberbank",
    548472: "sberbank",
    548477: "sberbank",
    548498: "sberbank",
    548499: "sberbank",
    605461: "sberbank",
    676195: "sberbank",
    676196: "sberbank",
    413877: "skb-bank",
    413878: "skb-bank",
    413879: "skb-bank",
    488951: "skb-bank",
    520920: "smp-bank",
    521326: "smp-bank",
    400287: "soyuz",
    400881: "soyuz",
    424352: "soyuz",
    432974: "soyuz",
    433710: "soyuz",
    433711: "soyuz",
    434381: "soyuz",
    434382: "soyuz",
    434383: "soyuz",
    434384: "soyuz",
    488967: "soyuz",
    488968: "soyuz",
    489008: "soyuz",
    489095: "soyuz",
    540670: "soyuz",
    522858: "spb-bank",
    530900: "spb-bank",
    532186: "spb-bank",
    541600: "spb-bank",
    543101: "spb-bank",
    552669: "spb-bank",
    676948: "spb-bank",
    417225: "tatfondbank",
    417226: "tatfondbank",
    417227: "tatfondbank",
    423217: "tatfondbank",
    427871: "tatfondbank",
    445034: "tatfondbank",
    515783: "tatfondbank",
    677225: "tatfondbank",
    437773: "tinkoff",
    521324: "tinkoff",
    553691: "tinkoff",
    530145: "transcapital",
    402877: "transcapital",
    478476: "transcapital",
    478474: "transcapital",
    478475: "transcapital",
    510074: "unicredit",
    518996: "unicredit",
    518997: "unicredit",
    522458: "unicredit",
    530172: "unicredit",
    531236: "unicredit",
    531344: "unicredit",
    547728: "unicredit",
    549302: "unicredit",
    676672: "unicredit",
    406140: "vbrr",
    406141: "vbrr",
    413203: "vbrr",
    413204: "vbrr",
    413205: "vbrr",
    417627: "visa-qiwi",
    417628: "visa-qiwi",
    417629: "visa-qiwi",
    426740: "visa-qiwi",
    428122: "visa-qiwi",
    469395: "visa-qiwi",
    489049: "visa-qiwi",
    423649: "vneshprombank",
    478471: "vneshprombank",
    478472: "vneshprombank",
    488993: "vneshprombank",
    510144: "vtb24",
    518591: "vtb24",
    518640: "vtb24",
    519304: "vtb24",
    519998: "vtb24",
    527883: "vtb24",
    529025: "vtb24",
    529938: "vtb24",
    535082: "vtb24",
    536829: "vtb24",
    540154: "vtb24",
    545224: "vtb24",
    549223: "vtb24",
    549270: "vtb24",
    549500: "vtb24",
    549866: "vtb24",
    554386: "vtb24",
    554393: "vtb24",
    558518: "vtb24",
    676421: "vtb24",
    676974: "vtb24",
    677470: "vtb24",
    677471: "vtb24",
    677517: "vtb24",
    427229: "vtb24",
    548387: "ym",
    518901: "ym",
    510621: "ym",
    559900: "ym",
    470434: "zenit",
    518647: "zenit",
    549413: "zenit",
    515760: "zenit",
    532461: "zenit",
    545896: "zenit",
    532463: "zenit",
    557944: "zenit",
    557960: "zenit",
    545929: "zenit",
    539850: "zenit",
    544852: "zenit",
    512449: "zenit",
    548767: "zenit",
    521194: "zenit",
    549882: "zenit",
    522851: "zenit",
    549888: "zenit",
    517667: "zenit",
    526891: "zenit",
    541778: "zenit",
    558696: "zenit",
    539613: "zenit",
    516358: "zenit",
    539898: "zenit",
    516333: "zenit",
    539607: "zenit",
    543301: "zenit",
    543236: "zenit",
    414658: "zenit",
    554780: "zenit",
    544025: "zenit",
    557029: "zenit",
    522456: "zenit",
    414656: "zenit",
    549411: "zenit",
    480232: "zenit",
    414659: "zenit",
    557030: "zenit",
    414657: "zenit",
    428266: "zenit"
};

