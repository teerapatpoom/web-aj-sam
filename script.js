// สร้างเมนูหัวเว็บแบบเดียวกันทุกหน้า แก้ที่นี่ที่เดียว
const pages = [
  ["index.html", "หน้าแรก"],
  ["quiz.html", "ค้นหาสายพันธุ์"],
  ["breeds.html", "สายพันธุ์เล็ก"],
  ["care.html", "สายพันธุ์กลาง"],
  ["food.html", "สายพันธุ์ใหญ่"],
  ["favorites.html", "สุนัขโปรด"],
  ["team.html", "ผู้จัดทำ"],
];
const current = document.body.dataset.page;
const links = pages
  .map(
    ([href, label]) =>
      `<li><a href="${href}"${href === current ? ' aria-current="page"' : ""}>${label}</a></li>`,
  )
  .join("");

document.getElementById("site-header").innerHTML = `
  <header class="site-header">
    <a href="index.html" class="logo" aria-label="Good Good Dog หน้าแรก">
      <span class="logo-badge" aria-hidden="true"><svg viewBox="0 0 24 24"><ellipse cx="5" cy="10" rx="2.2" ry="3"/><ellipse cx="9.5" cy="5.5" rx="2.2" ry="3"/><ellipse cx="14.5" cy="5.5" rx="2.2" ry="3"/><ellipse cx="19" cy="10" rx="2.2" ry="3"/><path d="M12 11c-3.5 0-6.5 3.2-6.5 6 0 2 1.6 3 3.2 3 1.3 0 2-.6 3.3-.6s2 .6 3.3.6c1.6 0 3.2-1 3.2-3 0-2.8-3-6-6.5-6z"/></svg></span>
      <span class="logo-text">Good Good Dog</span>
    </a>
    <button class="menu-toggle" aria-label="เปิดเมนู" aria-expanded="false" aria-controls="main-nav"><span></span></button>
    <nav class="nav" id="main-nav" aria-label="เมนูหลัก"><ul>${links}</ul></nav>
  </header>`;

const toggle = document.querySelector(".menu-toggle");
const nav = document.getElementById("main-nav");
toggle.addEventListener("click", () => {
  toggle.setAttribute("aria-expanded", nav.classList.toggle("open"));
});

const dogSearch = document.getElementById("dogSearch");

if (dogSearch) {
  const dogCards = document.querySelectorAll(".dog-list .dog-card");

  const resultText = document.getElementById("dogSearchResult");

  function filterDogs() {
    const keyword = dogSearch.value.trim().toLocaleLowerCase();
    let count = 0;

    dogCards.forEach((card) => {
      const text = card.textContent.toLocaleLowerCase();
      const match = text.includes(keyword);

      card.classList.toggle("search-hidden", !match);

      if (match) count++;
    });

    resultText.textContent = keyword
      ? `พบ ${count} สายพันธุ์`
      : `มีสุนัขทั้งหมด ${dogCards.length} สายพันธุ์`;
  }

  filterDogs();
  dogSearch.addEventListener("input", filterDogs);
}

// ระบบสลับโหมดสว่างและมืด
const themeToggle = document.getElementById("themeToggle");

function applyTheme(isDark) {
  document.body.classList.toggle("dark-mode", isDark);

  if (themeToggle) {
    themeToggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";

    themeToggle.setAttribute(
      "aria-label",
      isDark ? "เปิดโหมดสว่าง" : "เปิดโหมดมืด",
    );
  }
}

// โหลดธีมที่เคยเลือกไว้
const savedTheme = localStorage.getItem("goodGoodDogTheme");
applyTheme(savedTheme === "dark");

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const isDark = !document.body.classList.contains("dark-mode");

    applyTheme(isDark);

    localStorage.setItem("goodGoodDogTheme", isDark ? "dark" : "light");
  });
}

(() => {
  const namesKey = "goodGoodDogFavorites";
  const cardsKey = "goodGoodDogFavoriteCards";

  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(namesKey)) || [];
    } catch {
      return [];
    }
  }

  function getFavoriteCards() {
    try {
      return JSON.parse(localStorage.getItem(cardsKey)) || {};
    } catch {
      return {};
    }
  }

  function saveFavorites(names, cards) {
    localStorage.setItem(namesKey, JSON.stringify(names));
    localStorage.setItem(cardsKey, JSON.stringify(cards));
  }

  // เพิ่มปุ่มหัวใจบนการ์ดสุนัข
  document.querySelectorAll(".dog-card, .breed-card").forEach((card) => {
    const title = card.querySelector("h2, h3");
    if (!title) return;

    const dogName = title.textContent.trim();
    if (!dogName || card.querySelector(".favorite-btn")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "favorite-btn";

    function updateButton() {
      const isFavorite = getFavorites().includes(dogName);
      button.textContent = isFavorite ? "♥" : "♡";
      button.classList.toggle("is-favorite", isFavorite);
      button.setAttribute("aria-pressed", String(isFavorite));
      button.setAttribute(
        "aria-label",
        isFavorite
          ? `นำ ${dogName} ออกจากสุนัขโปรด`
          : `เพิ่ม ${dogName} เป็นสุนัขโปรด`,
      );
    }

    button.addEventListener("click", () => {
      const names = getFavorites();
      const cards = getFavoriteCards();
      const index = names.indexOf(dogName);

      if (index >= 0) {
        names.splice(index, 1);
        delete cards[dogName];
      } else {
        names.push(dogName);

        // บันทึกการ์ดไว้สำหรับหน้า favorites
        const copy = card.cloneNode(true);
        copy.querySelector(".favorite-btn")?.remove();
        cards[dogName] = copy.outerHTML;
      }

      saveFavorites(names, cards);
      updateButton();
    });

    card.appendChild(button);
    updateButton();
  });

  // แสดงการ์ดในหน้าสุนัขโปรด
  const favoritesContainer = document.getElementById("favoritesList");

  if (favoritesContainer) {
    const names = getFavorites();
    const cards = getFavoriteCards();
    const emptyMessage = document.getElementById("favoritesEmpty");
    const countMessage = document.getElementById("favoritesCount");

    favoritesContainer.innerHTML = "";

    names.forEach((name) => {
      if (!cards[name]) return;

      const wrapper = document.createElement("div");
      wrapper.innerHTML = cards[name].trim();
      const card = wrapper.firstElementChild;
      if (!card) return;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "favorite-btn is-favorite";
      button.textContent = "♥";
      button.setAttribute("aria-label", `นำ ${name} ออกจากสุนัขโปรด`);

      button.addEventListener("click", () => {
        const updatedNames = getFavorites().filter((item) => item !== name);
        const updatedCards = getFavoriteCards();
        delete updatedCards[name];
        saveFavorites(updatedNames, updatedCards);
        card.remove();

        if (countMessage) {
          countMessage.textContent = `สุนัขโปรด ${updatedNames.length} สายพันธุ์`;
        }

        if (emptyMessage && updatedNames.length === 0) {
          emptyMessage.hidden = false;
        }
      });

      card.appendChild(button);
      favoritesContainer.appendChild(card);
    });

    if (countMessage) {
      countMessage.textContent = `สุนัขโปรด ${names.length} สายพันธุ์`;
    }

    if (emptyMessage) {
      emptyMessage.hidden = names.length > 0;
    }
  }
})();

/* ===== ระบบแนะนำสายพันธุ์สุนัข ===== */
(() => {
  const form = document.getElementById("dogQuiz");
  if (!form) return;

  const dogs = [
    {
      name: "ชิวาวา (Chihuahua)",
      size: "เล็ก",
      page: "breeds.html",
      home: ["condo", "house"],
      time: "low",
      personality: ["independent"],
      grooming: "low",
      beginner: true,
      why: "ตัวเล็ก ใช้พื้นที่ไม่มาก และเล่นในบ้านได้ ควรระวังการตกจากที่สูงและดูแลไม่ให้หนาว",
    },
    {
      name: "พุดเดิ้ลทอย (Toy Poodle)",
      size: "เล็ก",
      page: "breeds.html",
      home: ["condo", "house"],
      time: "medium",
      personality: ["smart", "friendly"],
      grooming: "high",
      beginner: true,
      why: "ฉลาด เรียนรู้คำสั่งได้ดี เหมาะกับคนที่อยากฝึกสุนัขและพร้อมดูแลขนเป็นประจำ",
    },
    {
      name: "ชิสุ (Shih Tzu)",
      size: "เล็ก",
      page: "breeds.html",
      home: ["condo", "house"],
      time: "low",
      personality: ["calm", "friendly"],
      grooming: "high",
      beginner: true,
      why: "มักเป็นมิตรและไม่ต้องออกกำลังกายหนัก แต่ต้องใส่ใจการดูแลขนและระวังอากาศร้อน",
    },
    {
      name: "ปอมเมอเรเนียน (Pomeranian)",
      size: "เล็ก",
      page: "breeds.html",
      home: ["condo", "house"],
      time: "medium",
      personality: ["friendly", "independent"],
      grooming: "high",
      beginner: false,
      why: "ร่าเริงและตื่นตัว เหมาะกับคนที่มีเวลาเล่นด้วยและดูแลขนฟูอย่างสม่ำเสมอ",
    },
    {
      name: "เฟรนช์ บูลด็อก (French Bulldog)",
      size: "เล็ก",
      page: "breeds.html",
      home: ["condo", "house"],
      time: "low",
      personality: ["calm", "friendly"],
      grooming: "low",
      beginner: true,
      why: "เหมาะกับกิจกรรมเบา ๆ ต้องระวังอากาศร้อนและไม่ควรออกกำลังกายหนัก",
    },
    {
      name: "ดัชชุน (Dachshund)",
      size: "เล็ก",
      page: "breeds.html",
      home: ["condo", "house"],
      time: "medium",
      personality: ["independent"],
      grooming: "low",
      beginner: false,
      why: "กระตือรือร้นและชอบสำรวจ ควรดูแลน้ำหนักและหลีกเลี่ยงการกระโดดจากที่สูงบ่อย ๆ",
    },
    {
      name: "บีเกิล (Beagle)",
      size: "กลาง",
      page: "care.html",
      home: ["house", "yard"],
      time: "high",
      personality: ["friendly"],
      grooming: "low",
      beginner: false,
      why: "ร่าเริงและขี้เล่น ต้องมีเวลาออกกำลังกายทุกวัน รวมถึงดูแลหูและควบคุมน้ำหนัก",
    },
    {
      name: "เวลช์ คอร์กี้ (Welsh Corgi)",
      size: "กลาง",
      page: "care.html",
      home: ["house", "yard"],
      time: "medium",
      personality: ["smart", "friendly"],
      grooming: "medium",
      beginner: true,
      why: "ฉลาดและกระตือรือร้น เหมาะกับคนที่พร้อมเล่นและฝึกคำสั่ง รวมถึงดูแลน้ำหนักและหลัง",
    },
    {
      name: "ชิบะ อินุ (Shiba Inu)",
      size: "กลาง",
      page: "care.html",
      home: ["house", "yard"],
      time: "medium",
      personality: ["independent"],
      grooming: "medium",
      beginner: false,
      why: "มั่นใจและรักอิสระ เหมาะกับคนที่พร้อมฝึกอย่างสม่ำเสมอ",
    },
    {
      name: "บอร์เดอร์ คอลลี่ (Border Collie)",
      size: "กลาง",
      page: "care.html",
      home: ["yard"],
      time: "high",
      personality: ["smart"],
      grooming: "medium",
      beginner: false,
      why: "ฉลาดและเรียนรู้เร็ว ต้องมีเวลาออกกำลังกายและฝึกกระตุ้นสมองทุกวัน",
    },
    {
      name: "อิงลิช บูลด็อก (English Bulldog)",
      size: "กลาง",
      page: "care.html",
      home: ["condo", "house"],
      time: "low",
      personality: ["calm", "friendly"],
      grooming: "low",
      beginner: true,
      why: "มักชอบพักผ่อนและกิจกรรมเบา ๆ แต่ต้องระวังปัญหาการหายใจและอากาศร้อน",
    },
    {
      name: "โกลเด้น รีทรีฟเวอร์ (Golden Retriever)",
      size: "ใหญ่",
      page: "food.html",
      home: ["house", "yard"],
      time: "high",
      personality: ["friendly"],
      grooming: "high",
      beginner: true,
      why: "เป็นมิตรและชอบทำกิจกรรมกับคน ต้องมีเวลาออกกำลังกายและแปรงขนเป็นประจำ",
    },
    {
      name: "ลาบราดอร์ รีทรีฟเวอร์ (Labrador Retriever)",
      size: "ใหญ่",
      page: "food.html",
      home: ["house", "yard"],
      time: "high",
      personality: ["friendly", "smart"],
      grooming: "low",
      beginner: true,
      why: "ร่าเริง ฝึกได้ดี และชอบกิจกรรมกลางแจ้ง ต้องมีเวลาให้และควบคุมอาหารอย่างเหมาะสม",
    },
    {
      name: "ไซบีเรียน ฮัสกี้ (Siberian Husky)",
      size: "ใหญ่",
      page: "food.html",
      home: ["yard"],
      time: "high",
      personality: ["independent"],
      grooming: "high",
      beginner: false,
      why: "ต้องการกิจกรรมและการออกกำลังกายมาก มีขนหนาที่ผลัดขนเยอะ และต้องระวังอากาศร้อน",
    },
    {
      name: "เยอรมัน เชพเพิร์ด (German Shepherd)",
      size: "ใหญ่",
      page: "food.html",
      home: ["house", "yard"],
      time: "high",
      personality: ["smart"],
      grooming: "medium",
      beginner: false,
      why: "ฉลาดและฝึกได้ดี แต่ต้องฝึกเข้าสังคมและออกกำลังกายอย่างสม่ำเสมอ",
    },
    {
      name: "ร็อตไวเลอร์ (Rottweiler)",
      size: "ใหญ่",
      page: "food.html",
      home: ["house", "yard"],
      time: "medium",
      personality: ["smart", "independent"],
      grooming: "low",
      beginner: false,
      why: "มั่นใจและแข็งแรง เหมาะกับผู้ที่มีประสบการณ์และพร้อมฝึกอย่างต่อเนื่อง",
    },
  ];

  // คำนวณคะแนนจากคำตอบ
  function scoreDog(dog, answers) {
    let score = 0;

    if (dog.home.includes(answers.home)) score += 3;
    if (dog.time === answers.time) score += 3;

    if (dog.personality.includes(answers.personality)) {
      score += 3;
    }

    if (dog.grooming === answers.grooming) score += 2;

    if (answers.experience === "new" && dog.beginner) {
      score += 2;
    }

    if (answers.experience === "experienced" && !dog.beginner) {
      score += 1;
    }

    if (answers.experience === "some") score += 1;

    return score;
  }

  // เมื่อผู้ใช้กดปุ่มค้นหาสายพันธุ์
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const keys = ["home", "time", "personality", "grooming", "experience"];

    const answers = Object.fromEntries(keys.map((key) => [key, data.get(key)]));

    const error = document.getElementById("quizError");

    // ตรวจว่าตอบครบทุกข้อหรือยัง
    if (keys.some((key) => !answers[key])) {
      error.hidden = false;
      return;
    }

    error.hidden = true;

    // เรียงคะแนนจากมากไปน้อย แล้วเลือก 3 สายพันธุ์แรก
    const results = dogs
      .map((dog) => ({
        ...dog,
        score: scoreDog(dog, answers),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const list = document.getElementById("quizResultList");
    list.replaceChildren();

    results.forEach((dog, index) => {
      const card = document.createElement("article");
      card.className = "quiz-result-card";

      const title = document.createElement("h3");
      title.textContent = `${index + 1}. ${dog.name}`;

      const size = document.createElement("span");
      size.className = "quiz-score";
      size.textContent = `ขนาด${dog.size} • คะแนนความเข้ากัน ${dog.score}`;

      const why = document.createElement("p");
      why.textContent = dog.why;

      const link = document.createElement("a");
      link.href = dog.page;
      link.textContent = `ดูข้อมูลสุนัขขนาด${dog.size}`;

      card.append(title, size, why, link);
      list.appendChild(card);
    });

    const section = document.getElementById("quizResults");
    section.hidden = false;
    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
})();
