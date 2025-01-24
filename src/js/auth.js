window.onload = () => {

  let config = {
    logged: false,
    hashusr: 'c33a098336fea55ab9f7c8030e3ca164R5G9mUh2sjbIGQF5Ulwjug==',
    hashpwd: '873cf3e2eb426e056901b4d4ff5d77bfCYVLOLdopyEl5qr2Z92mDw==',
  };

  let encrypt = async (plaintext, password) => {
    let ptUtf8 = new TextEncoder().encode(plaintext);
    let pwUtf8 = new TextEncoder().encode(password);
    let pwHash = await window.crypto.subtle.digest('SHA-256', pwUtf8);
    let iv = window.crypto.getRandomValues(new Uint8Array(16));
    let alg = { name: 'AES-CBC', iv: iv };
    let key = await window.crypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt']);
    let ctBuffer = await window.crypto.subtle.encrypt(alg, key, ptUtf8);
    let ctArray = new Uint8Array(ctBuffer);
    let ctBase64 = btoa(String.fromCharCode(...ctArray));
    let ivHex = Array.from(iv).map(b => ('00' + b.toString(16)).slice(-2)).join('');
    return ivHex + ctBase64;
  };

  let decrypt = async (ciphertext, password) => {
    let ivHex = ciphertext.slice(0, 32);
    let ctBase64 = ciphertext.slice(32);
    let iv = new Uint8Array(ivHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    let ctStr = atob(ctBase64);
    let ctArray = new Uint8Array(ctStr.split('').map(c => c.charCodeAt(0)));
    let pwUtf8 = new TextEncoder().encode(password);
    let pwHash = await window.crypto.subtle.digest('SHA-256', pwUtf8);
    let alg = { name: 'AES-CBC', iv: iv };
    let key = await window.crypto.subtle.importKey('raw', pwHash, alg, false, ['decrypt']);
    let ptBuffer = await window.crypto.subtle.decrypt(alg, key, ctArray);
    let plaintext = new TextDecoder().decode(ptBuffer);
    return plaintext;
  };

  let validate = async (ciphertext, password) => password == await decrypt(ciphertext, password);

  let ls = {
    set: (a, b) => { localStorage.setItem(a, JSON.stringify(b)); },
    get: (a) => { return JSON.parse(localStorage.getItem(a)); },
    remove: (a) => { localStorage.removeItem(a); },
  };
  let ss = {
    set: (a, b) => { sessionStorage.setItem(a, JSON.stringify(b)); },
    get: (a) => { return JSON.parse(sessionStorage.getItem(a)); },
    remove: (a) => { sessiontorage.removeItem(a); },
  };


  let $ = (e) => document.querySelectorAll(e);

  $('#login').onsubmit = async (e) => {
    e.preventDefault();
    let data = Object.fromEntries(new FormData(e.target));
    config.logged = await validate(config.hashusr, data.usr) == await validate(config.hashpwd, data.pwd) == !config.logged;
    $('#container').hidden = !config.logged;
    $('#inText').hidden = !config.logged;
    $('#btSend').hidden = !config.logged;
    $('#containerLogin').hidden = config.logged;
    $('#inText').disabled = !config.logged;
    $('#btSend').disabled = !config.logged;
    $('#login').disabled = config.logged;
    $('#form').disabled = !config.logged;
    alert(`Access ${config.logged ? 'Granted' : 'Denied'}!`);
    e.target.reset();
    ss.set('config', config);
  };

};