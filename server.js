// server.ts
import express from "express";
import http from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { WebSocketServer, WebSocket } from "ws";

// src/data/defaultChallenges.ts
var DEFAULT_CHALLENGES = [
  {
    "id": "git-init",
    "category": "Temel Komutlar",
    "level": "Ba\u015Flang\u0131\xE7",
    "title": "Depo Ba\u015Flatma (Init)",
    "scenario": "Yeni bir web projesine ba\u015Fl\u0131yorsun. Proje dizininde s\xFCr\xFCm kontrol\xFCn\xFC ba\u015Flatmak i\xE7in yeni bir Git deposu olu\u015Fturmal\u0131s\u0131n.",
    "task": "Mevcut dizinde yeni bir Git deposu ba\u015Flat.",
    "commandPattern": "^git\\s+init(\\s+.*)?$",
    "solution": "git init",
    "hint": "Depoyu ilk defa olu\u015Ftururken kullan\u0131lan temel komuttur.",
    "explanation": "`git init` komutu ge\xE7erli klas\xF6rde gizli bir `.git` alt klas\xF6r\xFC olu\u015Fturarak versiyon takibini ba\u015Flat\u0131r.",
    "points": 100,
    "visualAction": {
      "type": "init",
      "branch": "main"
    }
  },
  {
    "id": "git-status",
    "category": "Durum & Takip",
    "level": "Ba\u015Flang\u0131\xE7",
    "title": "\xC7al\u0131\u015Fma Durumu \u0130nceleme",
    "scenario": "Baz\u0131 dosyalarda de\u011Fi\u015Fiklikler yapt\u0131n. Hangi dosyalar\u0131n izlenmedi\u011Fini (untracked) veya haz\u0131rl\u0131k alan\u0131nda (staged) oldu\u011Funu kontrol et.",
    "task": "\xC7al\u0131\u015Fma dizini ve haz\u0131rl\u0131k alan\u0131n\u0131n durumunu kontrol et.",
    "commandPattern": "^git\\s+status(\\s+.*)?$",
    "solution": "git status",
    "hint": "\xC7al\u0131\u015Fma alan\u0131n\u0131n o anki durumunu g\xF6steren komuttur.",
    "explanation": "`git status`, \xE7al\u0131\u015Fma a\u011Fac\u0131ndaki ve haz\u0131rl\u0131k alan\u0131ndaki de\u011Fi\u015Ftirilmi\u015F, eklenmi\u015F veya silinmi\u015F dosyalar\u0131 listeler.",
    "points": 100,
    "visualAction": {
      "type": "status"
    }
  },
  {
    "id": "git-add-all",
    "category": "Haz\u0131rl\u0131k Alan\u0131 (Staging)",
    "level": "Ba\u015Flang\u0131\xE7",
    "title": "T\xFCm De\u011Fi\u015Fiklikleri Haz\u0131rlama",
    "scenario": "Projede 'index.html' ve 'style.css' dosyalar\u0131n\u0131 g\xFCncelledin. T\xFCm bu dosyalar\u0131 bir sonraki commit i\xE7in haz\u0131rl\u0131k alan\u0131na (Staging Area / Index) g\xF6ndermelisin.",
    "task": "T\xFCm de\u011Fi\u015Ftirilen ve yeni eklenen dosyalar\u0131 haz\u0131rl\u0131k alan\u0131na ekle.",
    "commandPattern": "^git\\s+add\\s+(\\.|-A|--all)$",
    "solution": "git add .",
    "hint": "'git add' komutunun yan\u0131na t\xFCm dosyalar\u0131 temsil eden '.' veya '-A' koyabilirsin.",
    "explanation": "`git add .`, \xE7al\u0131\u015Fma dizinindeki t\xFCm de\u011Fi\u015Fiklikleri Staging alan\u0131na ta\u015F\u0131r ve commite haz\u0131r hale getirir.",
    "points": 120,
    "visualAction": {
      "type": "stage",
      "files": ["index.html", "style.css"]
    }
  },
  {
    "id": "git-commit",
    "category": "Kay\u0131t (Commit)",
    "level": "Ba\u015Flang\u0131\xE7",
    "title": "\u0130lk De\u011Fi\u015Fiklikleri Kaydetme",
    "scenario": "Haz\u0131rl\u0131k alan\u0131ndaki dosyalar\u0131 anlaml\u0131 bir mesajla yerel depoya kal\u0131c\u0131 olarak kaydetmelisin.",
    "task": '"feat: initial commit" mesaj\u0131yla commit olu\u015Ftur.',
    "commandPattern": `^git\\s+commit\\s+-m\\s+["']feat:\\s*initial\\s+commit["']$`,
    "solution": 'git commit -m "feat: initial commit"',
    "hint": "-m parametresi ile t\u0131rnak i\xE7inde commit mesaj\u0131 yazmal\u0131s\u0131n.",
    "explanation": '`git commit -m "..."`, haz\u0131rl\u0131k alan\u0131ndaki de\u011Fi\u015Fikliklerin kal\u0131c\u0131 bir anl\u0131k g\xF6r\xFCnt\xFCs\xFCn\xFC (snapshot) olu\u015Fturur.',
    "points": 150,
    "visualAction": {
      "type": "commit",
      "message": "feat: initial commit",
      "branch": "main"
    }
  },
  {
    "id": "git-branch-create",
    "category": "Dallar (Branches)",
    "level": "Orta",
    "title": "Yeni Dal A\xE7ma",
    "scenario": "Ana dal\u0131 bozmadan kullan\u0131c\u0131 giri\u015F \xF6zelli\u011Fi geli\u015Ftirmek istiyorsun. 'feature-login' ad\u0131nda yeni bir dal olu\u015Ftur.",
    "task": "'feature-login' ad\u0131nda yeni bir dal (branch) olu\u015Ftur.",
    "commandPattern": "^git\\s+branch\\s+feature-login$",
    "solution": "git branch feature-login",
    "hint": "'git branch <dal-ad\u0131>' s\xF6zdizimini kullan.",
    "explanation": "`git branch <ad>`, mevcut commit \xFCzerinde yeni bir i\u015Faret\xE7i (dal) yarat\u0131r ancak o dala otomatik ge\xE7i\u015F yapmaz.",
    "points": 130,
    "visualAction": {
      "type": "create_branch",
      "branch": "feature-login"
    }
  },
  {
    "id": "git-checkout-switch",
    "category": "Dallar (Branches)",
    "level": "Orta",
    "title": "Dallar Aras\u0131 Ge\xE7i\u015F",
    "scenario": "Yeni olu\u015Fturdu\u011Fun 'feature-login' dal\u0131na ge\xE7i\u015F yap\u0131p \xE7al\u0131\u015Fmalar\u0131n\u0131 orada s\xFCrd\xFCrmelisin.",
    "task": "'feature-login' dal\u0131na ge\xE7i\u015F yap.",
    "commandPattern": "^git\\s+(checkout|switch)\\s+feature-login$",
    "solution": "git checkout feature-login",
    "hint": "'git checkout feature-login' veya modern Git ile 'git switch feature-login' yazabilirsin.",
    "explanation": "`git checkout <dal>` veya `git switch <dal>`, HEAD i\u015Faret\xE7isini belirtilen dala y\xF6nlendirir.",
    "points": 130,
    "visualAction": {
      "type": "switch_branch",
      "branch": "feature-login"
    }
  },
  {
    "id": "git-checkout-b",
    "category": "Dallar (Branches)",
    "level": "Orta",
    "title": "Tek Hamlede Dal A\xE7\u0131p Ge\xE7me",
    "scenario": "Yeni bir \xF6zellik i\xE7in h\u0131zl\u0131ca hem dal a\xE7mak hem de an\u0131nda o dala ge\xE7mek istiyorsun. Dal ad\u0131: 'feature-cart'.",
    "task": "'feature-cart' ad\u0131nda yeni bir dal olu\u015Ftur ve hemen o dala ge\xE7.",
    "commandPattern": "^git\\s+(checkout\\s+-b|switch\\s+-c)\\s+feature-cart$",
    "solution": "git checkout -b feature-cart",
    "hint": "checkout komutunda '-b' veya switch komutunda '-c' parametresini kullan.",
    "explanation": "`git checkout -b <dal>`, dal olu\u015Fturma ve ge\xE7i\u015F i\u015Flemlerini tek bir ad\u0131mda birle\u015Ftirir.",
    "points": 140,
    "visualAction": {
      "type": "create_and_switch_branch",
      "branch": "feature-cart"
    }
  },
  {
    "id": "git-commit-feature",
    "category": "Kay\u0131t (Commit)",
    "level": "Orta",
    "title": "\xD6zellik Dal\u0131nda Commit",
    "scenario": "Sepet bile\u015Feni kodland\u0131 ve stajland\u0131. 'feat: add shopping cart' mesaj\u0131yla commit at.",
    "task": '"feat: add shopping cart" mesaj\u0131yla commit olu\u015Ftur.',
    "commandPattern": `^git\\s+commit\\s+-m\\s+["']feat:\\s*add\\s+shopping\\s+cart["']$`,
    "solution": 'git commit -m "feat: add shopping cart"',
    "hint": "-m parametresi ile t\u0131rnak i\xE7inde belirtilen mesaj\u0131 yaz.",
    "explanation": "\xD6zellik dal\u0131nda olu\u015Fturulan commit'ler HEAD i\u015Faret\xE7isi ile birlikte o dal\u0131 ileri ta\u015F\u0131r.",
    "points": 150,
    "visualAction": {
      "type": "commit",
      "message": "feat: add shopping cart",
      "branch": "feature-cart"
    }
  },
  {
    "id": "git-switch-main",
    "category": "Dallar (Branches)",
    "level": "Ba\u015Flang\u0131\xE7",
    "title": "Ana Dala Geri D\xF6n\xFC\u015F",
    "scenario": "\xD6zelli\u011Fi tamamlad\u0131n. \u015Eimdi birle\u015Ftirme (merge) yapmak \xFCzere ana dal olan 'main' dal\u0131na geri d\xF6n.",
    "task": "'main' dal\u0131na ge\xE7i\u015F yap.",
    "commandPattern": "^git\\s+(checkout|switch)\\s+main$",
    "solution": "git checkout main",
    "hint": "'git checkout main' veya 'git switch main' yazabilirsin.",
    "explanation": "Birle\u015Ftirmeden \xF6nce hedef dalda (genellikle `main`) bulunman\u0131z gerekir.",
    "points": 120,
    "visualAction": {
      "type": "switch_branch",
      "branch": "main"
    }
  },
  {
    "id": "git-merge",
    "category": "Birle\u015Ftirme (Merge)",
    "level": "Orta",
    "title": "Dallar\u0131 Birle\u015Ftirme",
    "scenario": "Main dal\u0131ndas\u0131n. 'feature-cart' dal\u0131ndaki t\xFCm yenilikleri ana 'main' dal\u0131na entegre etmelisin.",
    "task": "'feature-cart' dal\u0131n\u0131 bulundu\u011Fun ana dala birle\u015Ftir.",
    "commandPattern": "^git\\s+merge\\s+feature-cart$",
    "solution": "git merge feature-cart",
    "hint": "'git merge <birle\u015Ftirilecek-dal-ad\u0131>' s\xF6zdizimini kullan.",
    "explanation": "`git merge <dal>`, belirtilen dal\u0131n ge\xE7mi\u015Fini mevcut aktif dala dahil eder.",
    "points": 160,
    "visualAction": {
      "type": "merge",
      "sourceBranch": "feature-cart",
      "targetBranch": "main"
    }
  },
  {
    "id": "git-log-oneline",
    "category": "Ge\xE7mi\u015F & \u0130nceleme",
    "level": "Ba\u015Flang\u0131\xE7",
    "title": "Kompakt Ge\xE7mi\u015F G\xF6r\xFCnt\xFCleme",
    "scenario": "Projenin commit ge\xE7mi\u015Fini her sat\u0131rda tek bir commit ve k\u0131sa hash olacak \u015Fekilde temiz bir \xF6zet olarak listele.",
    "task": "Commit ge\xE7mi\u015Fini tek sat\u0131rl\u0131k formatta listele.",
    "commandPattern": "^git\\s+log\\s+--oneline$",
    "solution": "git log --oneline",
    "hint": "'git log' komutuna '--oneline' bayra\u011F\u0131 ekle.",
    "explanation": "`git log --oneline`, commit'lerin hash ve ba\u015Fl\u0131klar\u0131n\u0131 tek sat\u0131rda okunakl\u0131 bi\xE7imde s\u0131ralar.",
    "points": 110,
    "visualAction": {
      "type": "log"
    }
  },
  {
    "id": "git-remote-add",
    "category": "Uzak Depo (Remote)",
    "level": "Orta",
    "title": "Uzak Depo Tan\u0131mlama",
    "scenario": "GitHub \xFCzerinde bir repo a\xE7t\u0131n. Bu depoyu 'origin' takma ad\u0131yla yerel projene ba\u011Flamal\u0131s\u0131n.",
    "task": "'origin' ad\u0131yla 'https://github.com/company/app.git' adresini remote olarak ekle.",
    "commandPattern": "^git\\s+remote\\s+add\\s+origin\\s+https://github\\.com/company/app\\.git$",
    "solution": "git remote add origin https://github.com/company/app.git",
    "hint": "'git remote add origin <url>' format\u0131n\u0131 kullan.",
    "explanation": "`git remote add origin <url>`, yerel deponun buluttaki merkezi depo ile haberle\u015Fmesini sa\u011Flar.",
    "points": 140,
    "visualAction": {
      "type": "remote_add",
      "remote": "origin"
    }
  },
  {
    "id": "git-push",
    "category": "Uzak Depo (Remote)",
    "level": "Orta",
    "title": "Kodlar\u0131 Uzak Depoya G\xF6nderme",
    "scenario": "Yerelde tamamlanan 'main' dal\u0131n\u0131 uzak depodaki 'origin'e ilk kez takip\xE7i (upstream) belirterek push et.",
    "task": "'main' dal\u0131n\u0131 upstream belirterek origin'e g\xF6nder.",
    "commandPattern": "^git\\s+push\\s+(-u|--set-upstream)\\s+origin\\s+main$",
    "solution": "git push -u origin main",
    "hint": "-u bayra\u011F\u0131 gelecekteki 'git push' \xE7a\u011Fr\u0131lar\u0131 i\xE7in dal\u0131 origin/main'e ba\u011Flar.",
    "explanation": "`git push -u origin main`, yerel commit'leri uzak depoya y\xFCkler ve varsay\u0131lan upstream ili\u015Fkisi kurar.",
    "points": 160,
    "visualAction": {
      "type": "push",
      "remote": "origin",
      "branch": "main"
    }
  },
  {
    "id": "git-pull",
    "category": "Uzak Depo (Remote)",
    "level": "Orta",
    "title": "Uzak Depodaki G\xFCncellemeleri \xC7ekme",
    "scenario": "Ekip arkada\u015Flar\u0131n origin/main dal\u0131na yeni commit'ler g\xF6nderdi. Yerel deponu g\xFCncellemek i\xE7in bu de\u011Fi\u015Fiklikleri \xE7ek.",
    "task": "Uzak depodaki son de\u011Fi\u015Fiklikleri \xE7ekip birle\u015Ftir.",
    "commandPattern": "^git\\s+pull(\\s+origin\\s+main)?$",
    "solution": "git pull",
    "hint": "'git pull' uzak depodaki de\u011Fi\u015Fiklikleri hem indirir (fetch) hem birle\u015Ftirir (merge).",
    "explanation": "`git pull`, arka planda `git fetch` ve ard\u0131ndan `git merge` \xE7al\u0131\u015Ft\u0131rarak yerel dal\u0131n\u0131z\u0131 g\xFCnceller.",
    "points": 140,
    "visualAction": {
      "type": "pull",
      "branch": "main"
    }
  },
  {
    "id": "git-stash",
    "category": "Ge\xE7ici Saklama (Stash)",
    "level": "\u0130leri",
    "title": "De\u011Fi\u015Fiklikleri Zula Yapma (Stash)",
    "scenario": "Bir \xF6zellik kodlarken aniden acil bir hata d\xFCzeltmesi geldi. Hen\xFCz bitmemi\u015F yar\u0131m i\u015Flerini commit etmeden kenara sakla.",
    "task": "Bitmemi\u015F de\u011Fi\u015Fiklikleri zula alan\u0131na (stash) al.",
    "commandPattern": "^git\\s+stash(\\s+push)?$",
    "solution": "git stash",
    "hint": "'git stash' komutu \xE7al\u0131\u015Fma dizinini temizleyip de\u011Fi\u015Fiklikleri bellekte tutar.",
    "explanation": "`git stash`, hen\xFCz commit etmeye haz\u0131r olmad\u0131\u011F\u0131n\u0131z de\u011Fi\u015Fiklikleri ge\xE7ici bir y\u0131\u011F\u0131nda saklar ve \xE7al\u0131\u015Fma alan\u0131n\u0131 temizler.",
    "points": 150,
    "visualAction": {
      "type": "stash_save"
    }
  },
  {
    "id": "git-stash-pop",
    "category": "Ge\xE7ici Saklama (Stash)",
    "level": "\u0130leri",
    "title": "Zuladaki \u0130\u015Fleri Geri Alma",
    "scenario": "Acil d\xFCzeltmeyi tamamlad\u0131n. \u015Eimdi zuladaki (stash) yar\u0131m kalan i\u015Flerini geri \xE7a\u011F\u0131r\u0131p y\u0131\u011F\u0131ndan temizle.",
    "task": "En son zulalanan de\u011Fi\u015Fiklikleri geri y\xFCkle ve zula listesinden \xE7\u0131kar.",
    "commandPattern": "^git\\s+stash\\s+pop$",
    "solution": "git stash pop",
    "hint": "'pop' kelimesi hem uygular hem de listeden siler.",
    "explanation": "`git stash pop`, en son saklanan de\u011Fi\u015Fikli\u011Fi mevcut \xE7al\u0131\u015Fma kopyan\u0131za uygular ve y\u0131\u011F\u0131ndan d\xFC\u015F\xFCr\xFCr.",
    "points": 150,
    "visualAction": {
      "type": "stash_pop"
    }
  },
  {
    "id": "git-diff",
    "category": "Ge\xE7mi\u015F & \u0130nceleme",
    "level": "Ba\u015Flang\u0131\xE7",
    "title": "Farklar\u0131 \u0130nceleme (Diff)",
    "scenario": "Staging alan\u0131na hen\xFCz eklemedi\u011Fin \xE7al\u0131\u015Fma dosyalar\u0131ndaki sat\u0131r sat\u0131r de\u011Fi\u015Fiklikleri incelemek istiyorsun.",
    "task": "\xC7al\u0131\u015Fma dizini ile son commit aras\u0131ndaki farklar\u0131 g\xF6ster.",
    "commandPattern": "^git\\s+diff$",
    "solution": "git diff",
    "hint": "Farklar\u0131 (differences) g\xF6steren k\u0131sa komutu yaz.",
    "explanation": "`git diff`, hen\xFCz haz\u0131rl\u0131k alan\u0131na al\u0131nmam\u0131\u015F sat\u0131r bazl\u0131 de\u011Fi\u015Fiklikleri renkli \xE7\u0131kt\u0131 olarak verir.",
    "points": 110,
    "visualAction": {
      "type": "diff"
    }
  },
  {
    "id": "git-restore-staged",
    "category": "Geri Alma (Undo)",
    "level": "\u0130leri",
    "title": "Haz\u0131rl\u0131k Alan\u0131ndan \xC7\u0131karma (Unstage)",
    "scenario": "Yanl\u0131\u015Fl\u0131kla 'secret.key' dosyas\u0131n\u0131 'git add' ile stajlad\u0131n. Dosyay\u0131 silmeden sadece haz\u0131rl\u0131k alan\u0131ndan geri \xE7\u0131kar.",
    "task": "'secret.key' dosyas\u0131n\u0131 haz\u0131rl\u0131k alan\u0131ndan geri al (unstage yap).",
    "commandPattern": "^git\\s+(restore\\s+--staged|reset\\s+HEAD)\\s+secret\\.key$",
    "solution": "git restore --staged secret.key",
    "hint": "Modern Git komutu: 'git restore --staged <dosya>' veya geleneksel 'git reset HEAD <dosya>'.",
    "explanation": "`git restore --staged`, dosyan\u0131n diskteki i\xE7eri\u011Fini korurken onu bir sonraki commit listesinden \xE7\u0131kar\u0131r.",
    "points": 160,
    "visualAction": {
      "type": "unstage",
      "file": "secret.key"
    }
  },
  {
    "id": "git-reset-soft",
    "category": "Geri Alma (Undo)",
    "level": "\u0130leri",
    "title": "Son Commit'i Geri Alma (Soft Reset)",
    "scenario": "Son yapt\u0131\u011F\u0131n commit'te bir hata fark ettin. Commit'i iptal et ama dosyalardaki de\u011Fi\u015Fiklikleri staging alan\u0131nda koru.",
    "task": "Son commit'i iptal et ve dosyalar\u0131 haz\u0131rl\u0131k alan\u0131nda tut (soft reset).",
    "commandPattern": "^git\\s+reset\\s+--soft\\s+HEAD~1$",
    "solution": "git reset --soft HEAD~1",
    "hint": "'--soft HEAD~1' parametresi son commit'i \xE7\xF6zer ama de\u011Fi\u015Fiklikleri korur.",
    "explanation": "`git reset --soft HEAD~1`, HEAD i\u015Faret\xE7isini bir \xF6nceki commit'e \xE7eker fakat dosya de\u011Fi\u015Fikliklerini stajl\u0131 b\u0131rak\u0131r.",
    "points": 180,
    "visualAction": {
      "type": "reset_soft"
    }
  },
  {
    "id": "git-tag",
    "category": "Etiketleme (Tag)",
    "level": "Orta",
    "title": "S\xFCr\xFCm Etiketleme (Tag)",
    "scenario": "Uygulama canl\u0131ya \xE7\u0131kmaya haz\u0131r. Mevcut commit'e 'v1.0.0' ad\u0131nda hafif bir s\xFCr\xFCm etiketi ekle.",
    "task": "Mevcut commit noktas\u0131na 'v1.0.0' etiketini koy.",
    "commandPattern": "^git\\s+tag\\s+v1\\.0\\.0$",
    "solution": "git tag v1.0.0",
    "hint": "'git tag <etiket-ad\u0131>' komutunu yaz.",
    "explanation": "`git tag`, depodaki belirli ve \xF6nemli bir commit noktas\u0131n\u0131 (\xF6rn: release) i\u015Faretlemek i\xE7in kullan\u0131l\u0131r.",
    "points": 130,
    "visualAction": {
      "type": "tag",
      "tag": "v1.0.0"
    }
  },
  {
    "id": "git-branch-delete",
    "category": "Dallar (Branches)",
    "level": "Orta",
    "title": "Birle\u015Ftirilmi\u015F Dal\u0131 Temizleme",
    "scenario": "'feature-login' dal\u0131 main dal\u0131na sorunsuzca birle\u015Ftirildi. Art\u0131k gerekmeyen bu yerel dal\u0131 g\xFCvenli \u015Fekilde sil.",
    "task": "'feature-login' yerel dal\u0131n\u0131 sil.",
    "commandPattern": "^git\\s+branch\\s+(-d|--delete)\\s+feature-login$",
    "solution": "git branch -d feature-login",
    "hint": "-d parametresi g\xFCvenli silme sa\u011Flar (yaln\u0131zca merge edilmi\u015Fse siler).",
    "explanation": "`git branch -d <dal>`, ana dala birle\u015Ftirilmi\u015F tamamlanm\u0131\u015F \xF6zellikleri temiz tutmak i\xE7in yerel dal i\u015Faret\xE7isini kald\u0131r\u0131r.",
    "points": 140,
    "visualAction": {
      "type": "delete_branch",
      "branch": "feature-login"
    }
  },
  {
    "id": "git-rebase",
    "category": "\u0130leri D\xFCzey (Rebase)",
    "level": "\u0130leri",
    "title": "Dal\u0131 Yeniden Temellendirme (Rebase)",
    "scenario": "\xD6zellik dal\u0131ndas\u0131n. Ana daldaki (main) yeni commit'leri temiz, do\u011Frusal bir ge\xE7mi\u015F i\xE7in dal\u0131n\u0131n taban\u0131na uygula.",
    "task": "Bulundu\u011Fun dal\u0131 'main' dal\u0131 \xFCzerine rebase yap.",
    "commandPattern": "^git\\s+rebase\\s+main$",
    "solution": "git rebase main",
    "hint": "'git rebase <hedef-dal>' komutuyla do\u011Frusal bir commit zinciri elde edilir.",
    "explanation": "`git rebase`, bir daldaki commit dizisini al\u0131r ve ba\u015Fka bir taban commit \xFCzerine s\u0131rayla yeniden oynat\u0131r.",
    "points": 190,
    "visualAction": {
      "type": "rebase",
      "base": "main"
    }
  }
];

// server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var PORT = parseInt(process.env.PORT || "3000", 10);
var DATA_DIR = path.join(__dirname, "data");
var SESSION_FILE = path.join(DATA_DIR, "session.json");
var CHALLENGES_FILE = path.join(DATA_DIR, "challenges.json");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
var challenges = [];
try {
  if (fs.existsSync(CHALLENGES_FILE)) {
    const challengesRaw = fs.readFileSync(CHALLENGES_FILE, "utf-8");
    challenges = JSON.parse(challengesRaw);
  }
} catch (err) {
  console.error("Failed to load challenges from file:", err);
}
if (!Array.isArray(challenges) || challenges.length === 0) {
  challenges = [...DEFAULT_CHALLENGES];
  try {
    fs.writeFileSync(CHALLENGES_FILE, JSON.stringify(challenges, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write default challenges:", err);
  }
}
var sessionState = {
  sessionId: "session-default",
  status: "waiting",
  durationSeconds: 900,
  // 15 minutes
  timeRemaining: 900,
  startedAt: null,
  endsAt: null,
  activeChallengeIds: challenges.map((c) => c.id),
  players: []
};
if (fs.existsSync(SESSION_FILE)) {
  try {
    const sessionRaw = fs.readFileSync(SESSION_FILE, "utf-8");
    const parsed = JSON.parse(sessionRaw);
    sessionState = {
      ...sessionState,
      ...parsed,
      players: parsed.players || []
    };
  } catch (e) {
    console.error("Error reading session file, using defaults:", e);
  }
}
if (!Array.isArray(sessionState.activeChallengeIds) || sessionState.activeChallengeIds.length === 0) {
  sessionState.activeChallengeIds = challenges.map((c) => c.id);
  try {
    fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionState, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write default session:", err);
  }
}
function persistSession() {
  try {
    fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionState, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write session file:", err);
  }
}
var app = express();
app.use(express.json());
var server = http.createServer(app);
var wss = new WebSocketServer({ server });
var clientMap = /* @__PURE__ */ new Map();
function broadcast(msg) {
  const serialized = JSON.stringify(msg);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(serialized);
    }
  }
}
function broadcastSession() {
  broadcast({
    type: "session_state",
    payload: sessionState
  });
}
var timerInterval = null;
function startSessionTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (sessionState.status === "running") {
      if (sessionState.timeRemaining > 0) {
        sessionState.timeRemaining -= 1;
        broadcastSession();
        if (sessionState.timeRemaining % 15 === 0) {
          persistSession();
        }
      } else {
        sessionState.status = "finished";
        persistSession();
        broadcastSession();
        broadcast({
          type: "notification",
          payload: {
            message: "Oturum s\xFCresi (15 dakika) tamamland\u0131! Tebrikler!",
            style: "warning"
          }
        });
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = null;
      }
    }
  }, 1e3);
}
function registerOrUpdatePlayer(playerId, name, avatar) {
  let player = sessionState.players.find((p) => p.id === playerId);
  if (!player) {
    player = {
      id: playerId,
      name: name || "Geli\u015Ftirici",
      avatar: avatar || "\u{1F431}",
      score: 0,
      strike: 0,
      maxStrike: 0,
      completedChallengeIds: [],
      currentChallengeIndex: 0,
      lastActiveAt: Date.now(),
      isOnline: true
    };
    sessionState.players.push(player);
  } else {
    player.name = name || player.name;
    player.avatar = avatar || player.avatar;
    player.isOnline = true;
    player.lastActiveAt = Date.now();
  }
  persistSession();
  broadcastSession();
  return player;
}
function executePlayerCommand(playerId, challengeId, command) {
  const player = sessionState.players.find((p) => p.id === playerId);
  if (!player) return { error: "Oyuncu bulunamad\u0131" };
  const challenge = challenges.find((c) => c.id === challengeId);
  if (!challenge) return { error: "G\xF6rev bulunamad\u0131" };
  const trimmedCmd = (command || "").trim();
  const regex = new RegExp(challenge.commandPattern, "i");
  const isCorrect = regex.test(trimmedCmd);
  if (isCorrect) {
    const nextStrike = (player.strike || 0) + 1;
    player.strike = nextStrike;
    player.maxStrike = Math.max(player.maxStrike || 0, nextStrike);
    const multiplier = nextStrike === 1 ? 1 : nextStrike === 2 ? 1.5 : nextStrike === 3 ? 2 : nextStrike === 4 ? 2.5 : 3;
    const pointsEarned = Math.round(challenge.points * multiplier);
    player.score += pointsEarned;
    player.lastActiveAt = Date.now();
    if (!player.completedChallengeIds.includes(challengeId)) {
      player.completedChallengeIds.push(challengeId);
    }
    const activeIds = sessionState.activeChallengeIds;
    const currentFilteredIdx = activeIds.indexOf(challengeId);
    if (currentFilteredIdx !== -1 && currentFilteredIdx + 1 < activeIds.length) {
      player.currentChallengeIndex = currentFilteredIdx + 1;
    }
    const isAllCompleted = player.completedChallengeIds.length >= activeIds.length;
    if (nextStrike >= 2) {
      broadcast({
        type: "strike_event",
        payload: {
          playerId: player.id,
          playerName: player.name,
          avatar: player.avatar,
          strike: nextStrike,
          pointsEarned,
          challengeTitle: challenge.title
        }
      });
    }
    persistSession();
    broadcastSession();
    return {
      success: true,
      playerId: player.id,
      challengeId: challenge.id,
      pointsEarned,
      strike: nextStrike,
      message: `Harika! Komut ba\u015Far\u0131yla uyguland\u0131 (+${pointsEarned} Puan${nextStrike > 1 ? ` | ${nextStrike}x STRIKE!` : ""})`,
      visualAction: challenge.visualAction,
      completedAll: isAllCompleted
    };
  } else {
    const previousStrike = player.strike || 0;
    player.strike = 0;
    const penaltyPoints = 25;
    const previousScore = player.score || 0;
    player.score = Math.max(0, previousScore - penaltyPoints);
    player.lastActiveAt = Date.now();
    const brokeStrike = previousStrike > 0;
    persistSession();
    broadcastSession();
    return {
      success: false,
      playerId: player.id,
      challengeId: challenge.id,
      strike: 0,
      pointsLost: penaltyPoints,
      brokeStrike,
      message: `Hatal\u0131 komut! Do\u011Fru s\xF6zdizimini kontrol et. (-${penaltyPoints} XP${brokeStrike ? ` | ${previousStrike}x Strike bozuldu!` : ""}) (\u0130pucu: ${challenge.hint})`
    };
  }
}
app.get("/api/session", (req, res) => {
  res.json(sessionState);
});
app.get("/api/challenges", (req, res) => {
  res.json(challenges);
});
app.post("/api/player/join", (req, res) => {
  const { playerId, name, avatar } = req.body;
  if (!playerId) {
    return res.status(400).json({ error: "playerId gerekli" });
  }
  const player = registerOrUpdatePlayer(playerId, name, avatar);
  res.json({ success: true, player, sessionState });
});
app.post("/api/submit_command", (req, res) => {
  const { playerId, challengeId, command } = req.body;
  if (!playerId || !challengeId) {
    return res.status(400).json({ error: "Eksik parametre" });
  }
  const result = executePlayerCommand(playerId, challengeId, command);
  res.json(result);
});
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === "1234") {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Ge\xE7ersiz \u015Fifre!" });
  }
});
app.post("/api/admin/config", (req, res) => {
  const { password, activeChallengeIds, durationMinutes } = req.body;
  if (password !== "1234") {
    return res.status(401).json({ success: false, message: "Yetkisiz eri\u015Fim" });
  }
  if (Array.isArray(activeChallengeIds)) {
    sessionState.activeChallengeIds = activeChallengeIds.length > 0 ? activeChallengeIds : challenges.map((c) => c.id);
  }
  if (typeof durationMinutes === "number" && durationMinutes > 0) {
    sessionState.durationSeconds = durationMinutes * 60;
    if (sessionState.status === "waiting") {
      sessionState.timeRemaining = sessionState.durationSeconds;
    }
  }
  persistSession();
  broadcastSession();
  res.json({ success: true, sessionState });
});
wss.on("connection", (ws, req) => {
  console.log(`[WS] Client connected from ${req.socket.remoteAddress}, URL: ${req.url}`);
  clientMap.set(ws, {});
  ws.send(JSON.stringify({ type: "session_state", payload: sessionState }));
  ws.on("message", (dataRaw) => {
    try {
      const message = JSON.parse(dataRaw.toString());
      const clientMeta = clientMap.get(ws) || {};
      switch (message.type) {
        case "join": {
          const { playerId, name, avatar } = message.payload;
          clientMeta.playerId = playerId;
          clientMap.set(ws, clientMeta);
          registerOrUpdatePlayer(playerId, name, avatar);
          break;
        }
        case "submit_command": {
          const { playerId, challengeId, command } = message.payload;
          const result = executePlayerCommand(playerId, challengeId, command);
          if ("error" in result) {
            ws.send(
              JSON.stringify({
                type: "command_result",
                payload: {
                  playerId,
                  challengeId,
                  success: false,
                  strike: 0,
                  message: result.error
                }
              })
            );
          } else {
            ws.send(
              JSON.stringify({
                type: "command_result",
                payload: result
              })
            );
          }
          break;
        }
        case "admin_login": {
          const { password } = message.payload;
          if (password === "1234") {
            clientMeta.isAdmin = true;
            clientMap.set(ws, clientMeta);
            ws.send(
              JSON.stringify({
                type: "admin_auth_result",
                payload: { success: true }
              })
            );
          } else {
            ws.send(
              JSON.stringify({
                type: "admin_auth_result",
                payload: { success: false, message: "Hatal\u0131 \u015Fifre!" }
              })
            );
          }
          break;
        }
        case "admin_start": {
          if (!clientMeta.isAdmin) {
            clientMeta.isAdmin = true;
          }
          const duration = message.payload?.durationMinutes ? message.payload.durationMinutes * 60 : sessionState.durationSeconds || 900;
          sessionState.status = "running";
          sessionState.durationSeconds = duration;
          sessionState.timeRemaining = duration;
          sessionState.startedAt = Date.now();
          sessionState.endsAt = Date.now() + duration * 1e3;
          startSessionTimer();
          persistSession();
          broadcastSession();
          broadcast({
            type: "notification",
            payload: {
              message: `Oyun ba\u015Flad\u0131! ${Math.round(duration / 60)} dakikal\u0131k oturum ba\u015Flad\u0131. Bol \u015Fans!`,
              style: "success"
            }
          });
          break;
        }
        case "admin_pause": {
          if (sessionState.status === "running") {
            sessionState.status = "paused";
          } else if (sessionState.status === "paused") {
            sessionState.status = "running";
          }
          persistSession();
          broadcastSession();
          break;
        }
        case "admin_stop": {
          sessionState.status = "finished";
          sessionState.timeRemaining = 0;
          if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
          }
          persistSession();
          broadcastSession();
          broadcast({
            type: "notification",
            payload: {
              message: "Oturum y\xF6netici taraf\u0131ndan sonland\u0131r\u0131ld\u0131! Sonu\xE7lar a\xE7\u0131kland\u0131.",
              style: "warning"
            }
          });
          break;
        }
        case "admin_reset": {
          sessionState.status = "waiting";
          sessionState.timeRemaining = sessionState.durationSeconds;
          sessionState.startedAt = null;
          sessionState.endsAt = null;
          if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
          }
          persistSession();
          broadcastSession();
          broadcast({
            type: "notification",
            payload: {
              message: "Oyun admin taraf\u0131ndan s\u0131f\u0131rland\u0131. Yeni oturum bekleniyor.",
              style: "info"
            }
          });
          break;
        }
        case "admin_set_challenges": {
          if (Array.isArray(message.payload?.activeChallengeIds) && message.payload.activeChallengeIds.length > 0) {
            sessionState.activeChallengeIds = message.payload.activeChallengeIds;
          } else {
            sessionState.activeChallengeIds = challenges.map((c) => c.id);
          }
          persistSession();
          broadcastSession();
          break;
        }
        case "admin_reset_scores": {
          sessionState.players.forEach((p) => {
            p.score = 0;
            p.strike = 0;
            p.maxStrike = 0;
            p.completedChallengeIds = [];
            p.currentChallengeIndex = 0;
          });
          persistSession();
          broadcastSession();
          broadcast({
            type: "notification",
            payload: {
              message: "T\xFCm skorlar ve kombolar s\u0131f\u0131rland\u0131.",
              style: "info"
            }
          });
          break;
        }
        case "heartbeat": {
          const { playerId } = message.payload;
          const p = sessionState.players.find((pl) => pl.id === playerId);
          if (p) {
            p.isOnline = true;
            p.lastActiveAt = Date.now();
          }
          break;
        }
      }
    } catch (err) {
      console.error("Error handling ws message:", err);
    }
  });
  ws.on("close", () => {
    const meta = clientMap.get(ws);
    if (meta?.playerId) {
      const p = sessionState.players.find((pl) => pl.id === meta.playerId);
      if (p) {
        p.isOnline = false;
        persistSession();
        broadcastSession();
      }
    }
    clientMap.delete(ws);
  });
});
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`GitMaster Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
