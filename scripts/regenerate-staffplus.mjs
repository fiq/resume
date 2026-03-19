import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const sourcePath = path.resolve(repoRoot, "resume_content_staffplus.md");
const outputPath = path.resolve(repoRoot, "cv", "index.html");

const STATIC_CONTACT = {
  emailHref: "mailto:raf@dreamthought.com",
  emailLabel: "raf AT dreamthought.com",
  passportLabel: "British and New Zealand Citizen",
  alternateCvHref: "https://fiq.github.io/resume/cv/cto.html",
  alternateCvLabel: "Executive Leadership CV"
};

const STATIC_EDUCATION_DATES = new Map([
  ["BSc (Hons) Computer Science and Artificial Intelligence", "1994 - 1999"]
]);

const FIXED_SECTION_TITLES = new Set([
  "Header Tagline",
  "Header Credibility Line",
  "Credibility Line",
  "Summary",
  "Technical Leadership Focus",
  "Earlier Technical Experience",
  "Earlier Career Highlights",
  "Community & Industry Contribution",
  "Community & Industry Contributions",
  "Technical Foundations",
  "Technical Expertise",
  "Education"
]);

const REQUIRED_SECTION_GROUPS = [
  ["Header Tagline"],
  ["Header Credibility Line", "Credibility Line"],
  ["Summary"],
  ["Technical Leadership Focus"],
  ["Earlier Technical Experience", "Earlier Career Highlights"],
  ["Community & Industry Contribution", "Community & Industry Contributions"],
  ["Technical Foundations", "Technical Expertise"],
  ["Education"]
];

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderInlineMarkdown(text) {
  const escaped = escapeHtml(text);
  return escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitSections(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const sections = [];
  let current = null;

  for (const line of lines) {
    const heading = line.match(/^# (.+)$/);
    if (heading) {
      current = { title: heading[1].trim(), lines: [] };
      sections.push(current);
      continue;
    }

    if (!current) {
      continue;
    }

    if (line.trim() === "---") {
      continue;
    }

    current.lines.push(line);
  }

  return sections;
}

function parseBlocks(lines) {
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    if (lines[index].trim() === "") {
      index += 1;
      continue;
    }

    if (lines[index].startsWith("- ")) {
      const items = [];
      while (index < lines.length && lines[index].startsWith("- ")) {
        items.push(lines[index].slice(2).trim());
        index += 1;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    const paragraphLines = [];
    while (
      index < lines.length &&
      lines[index].trim() !== "" &&
      !lines[index].startsWith("- ")
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
  }

  return blocks;
}

function getRequiredSection(byTitle, titles) {
  const options = Array.isArray(titles) ? titles : [titles];
  for (const title of options) {
    const section = byTitle.get(title);
    if (section) {
      return section;
    }
  }
  throw new Error(`Missing required section: ${options.join(" or ")}`);
}

function validateRequiredSections(byTitle) {
  for (const titles of REQUIRED_SECTION_GROUPS) {
    getRequiredSection(byTitle, titles);
  }
}

function getSingleParagraphText(section, title) {
  const blocks = parseBlocks(section.lines);
  const paragraph = blocks.find((block) => block.type === "paragraph");
  if (!paragraph?.text) {
    throw new Error(`Expected paragraph content in section: ${title}`);
  }
  return paragraph.text;
}

function parseContactSection(section) {
  const lines = section.lines.map((line) => line.trim()).filter(Boolean);
  const location = lines[0] || "";
  const profiles = [];

  for (const line of lines.slice(1)) {
    const match = line.match(/^([^:]+):\s+(.+)$/);
    if (!match) {
      continue;
    }

    const label = match[1].trim();
    const value = match[2].trim();
    const hrefValue = value.startsWith("http") ? value : `https://${value}`;
    profiles.push({ label, value, href: hrefValue });
  }

  if (!location) {
    throw new Error(`Contact section "${section.title}" is missing a location line.`);
  }

  if (profiles.length === 0) {
    throw new Error(`Contact section "${section.title}" is missing profile links.`);
  }

  return { name: section.title, location, profiles, title: section.title };
}

function findContactSection(sections) {
  const matches = sections.filter((section) => {
    const lines = section.lines.map((line) => line.trim()).filter(Boolean);
    return lines.some((line) => /^LinkedIn:\s+/i.test(line)) &&
      lines.some((line) => /^GitHub:\s+/i.test(line));
  });

  if (matches.length !== 1) {
    throw new Error(
      `Expected exactly one contact section with LinkedIn and GitHub lines, found ${matches.length}.`
    );
  }

  return matches[0];
}

function parseRoleSection(section) {
  const lines = section.lines.slice();
  while (lines[0] && lines[0].trim() === "") {
    lines.shift();
  }

  const employer = lines.shift()?.trim() || "";
  const date = lines.shift()?.trim() || "";
  const blocks = parseBlocks(lines);

  if (!employer || !date) {
    throw new Error(
      `Role section "${section.title}" must start with employer and date lines.`
    );
  }

  if (blocks.length === 0) {
    throw new Error(`Role section "${section.title}" has no body content.`);
  }

  return {
    title: section.title,
    employer,
    date,
    blocks
  };
}

function renderProfile(profile) {
  const icon =
    profile.label === "LinkedIn"
      ? '<i class="fab fa-linkedin-in fa-fw"></i>'
      : profile.label === "GitHub"
        ? '<i class="fab fa-github-alt fa-fw"></i>'
        : '<i class="fas fa-globe"></i>';

  return `              <li class="mb-1 contact-list">
                <span class="badge">
                  <a
                    href="${escapeHtml(profile.href)}"
                    target="_blank"
                    rel="noopener"
                  >
                    <span class="fa-container text-center me-2">
                      ${icon}
                    </span>
                    ${escapeHtml(profile.value)}
                  </a>
                </span>
              </li>`;
}

function renderParagraph(text, className = "") {
  const classAttr = className ? ` class="${className}"` : "";
  return `              <p${classAttr}>
                ${renderInlineMarkdown(text)}
              </p>`;
}

function renderList(items, className = "role-bullets") {
  const renderedItems = items
    .map(
      (item) => `                <li>
                  ${renderInlineMarkdown(item)}
                </li>`
    )
    .join("\n");

  return `              <ul class="${className}">
${renderedItems}
              </ul>`;
}

function renderRole(role) {
  const content = role.blocks
    .map((block) => {
      if (block.type === "list") {
        return renderList(block.items);
      }

      const className =
        block.text.startsWith("(") && block.text.endsWith(")")
          ? "role-note"
          : "role-context";

      return renderParagraph(block.text, className);
    })
    .join("\n");

  return `            <article class="job-block role-section">
              <div class="role-heading">
                <div>
                  <h3 class="job-description">${escapeHtml(role.title)}</h3>
                  <div class="job-employer">${renderInlineMarkdown(role.employer)}</div>
                </div>
                <div class="job-date">${escapeHtml(role.date)}</div>
              </div>
${content}
            </article>`;
}

function renderSimpleSection(title, blocks, options = {}) {
  const sectionId = options.id || slugify(title);
  const sectionClasses = options.sectionClasses || "content";
  const listClassName = options.listClassName || "role-bullets";
  const introClassName = options.introClassName || "";

  const inner = blocks
    .map((block, index) => {
      if (block.type === "list") {
        return renderList(block.items, listClassName);
      }

      return renderParagraph(block.text, index === 0 ? introClassName : "");
    })
    .join("\n");

  return `          <section class="${sectionClasses}" id="${sectionId}">
            <h2 class="section-title">${escapeHtml(title)}</h2>
${inner}
          </section>`;
}

function renderEarlierCareer(section) {
  const entries = parseBlocks(section.lines)
    .filter((block) => block.type === "paragraph")
    .map((block) => block.text);

  return `          <section class="content" id="earlier-career">
            <h2 class="section-title">${escapeHtml(section.title)}</h2>
            <ul class="role-bullets compact-list">
${entries
  .map(
    (entry) => `              <li>
                ${renderInlineMarkdown(entry)}
              </li>`
  )
  .join("\n")}
            </ul>
          </section>`;
}

function renderEducation(section) {
  const entries = [];
  let currentLines = [];

  for (const line of section.lines) {
    if (line.trim() === "") {
      if (currentLines.length > 0) {
        entries.push(currentLines);
        currentLines = [];
      }
      continue;
    }

    currentLines.push(line.trim());
  }

  if (currentLines.length > 0) {
    entries.push(currentLines);
  }

  return `          <section class="content mb-5" id="education">
            <h2 class="section-title">Education &amp; Certifications</h2>
            <div class="education-list">
${entries
  .map((entryLines) => {
    const [title, institute] = entryLines;
    const date = STATIC_EDUCATION_DATES.get(title);
    return `              <div class="education-item">
                <h3 class="education-title">
                  ${escapeHtml(title)}
                </h3>
${institute ? `                <div class="education-institute">
                  ${escapeHtml(institute)}
                </div>
` : ""}${date ? `                <div class="education-date">${escapeHtml(date)}</div>
` : ""}              </div>`;
  })
  .join("\n")}
            </div>
          </section>`;
}

function buildHtml(sections) {
  const byTitle = new Map(sections.map((section) => [section.title, section]));
  validateRequiredSections(byTitle);

  const contact = parseContactSection(findContactSection(sections));
  const taglineSection = getRequiredSection(byTitle, "Header Tagline");
  const credibilitySection = getRequiredSection(byTitle, [
    "Header Credibility Line",
    "Credibility Line"
  ]);
  const summarySection = getRequiredSection(byTitle, "Summary");
  const leadershipFocusSection = getRequiredSection(byTitle, "Technical Leadership Focus");
  const earlierCareerSection = getRequiredSection(byTitle, [
    "Earlier Technical Experience",
    "Earlier Career Highlights"
  ]);
  const communitySection = getRequiredSection(byTitle, [
    "Community & Industry Contribution",
    "Community & Industry Contributions"
  ]);
  const technicalFoundationsSection = getRequiredSection(byTitle, [
    "Technical Foundations",
    "Technical Expertise"
  ]);
  const educationSection = getRequiredSection(byTitle, "Education");

  const summary = parseBlocks(summarySection.lines);
  const leadershipFocus = parseBlocks(leadershipFocusSection.lines);
  const community = parseBlocks(communitySection.lines);
  const technicalFoundations = parseBlocks(technicalFoundationsSection.lines);

  const roles = sections
    .filter((section) => {
      return section.title !== contact.title && !FIXED_SECTION_TITLES.has(section.title);
    })
    .map(parseRoleSection);

  if (roles.length === 0) {
    throw new Error("No role sections found.");
  }

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, shrink-to-fit=no"
    />
    <link
      href="https://fonts.googleapis.com/css?family=Roboto:400,500,400italic,300italic,300,500italic,700,700italic,900,900italic"
      rel="stylesheet"
      type="text/css"
    />
    <script
      src="https://kit.fontawesome.com/84636a2059.js"
      crossorigin="anonymous"
    ></script>
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
      rel="stylesheet"
      integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
      crossorigin="anonymous"
    />
    <link rel="stylesheet" type="text/css" href="style.css" />
    <title>${escapeHtml(contact.name)} - Senior Technical Leadership CV</title>
  </head>

  <body class="resume-staffplus">
    <header class="container-fluid intro">
      <div class="d-flex flex-column flex-md-row align-items-center">
        <img
          class="profile-img img-fluid rounded-circle mx-auto mt-1"
          src="images/raf.png"
          alt="${escapeHtml(contact.name)}"
        />
        <div
          class="flex-grow-1 flex-column flex-md-row d-flex mx-auto mx-lg-0 p-1"
        >
          <div class="info-left header-content">
            <h1 class="mb-0 h3">${escapeHtml(contact.name)}</h1>
            <div class="intro-title mb-2 ps-4">
              ${renderInlineMarkdown(getSingleParagraphText(taglineSection, taglineSection.title))}
            </div>
            <div class="intro-credibility ps-4">
              ${renderInlineMarkdown(getSingleParagraphText(credibilitySection, credibilitySection.title))}
            </div>
            <ul class="list-unstyled">
              <li class="contact-list">
                <a href="${escapeHtml(STATIC_CONTACT.emailHref)}">
                  <i
                    class="fas fa-envelope fa-fw me-2"
                    data-fa-transform="grow-2"
                  ></i>
                  ${escapeHtml(STATIC_CONTACT.emailLabel)}
                </a>
              </li>
              <li class="contact-list">
                <a
                  href="https://www.google.com/maps?q=${encodeURIComponent(contact.location.toLowerCase())}"
                  target="_blank"
                  rel="noopener"
                >
                  <i
                    class="fas fa-map-marker fa-fw me-2"
                    data-fa-transform="grow-2"
                  ></i>
                  ${escapeHtml(contact.location)}
                </a>
              </li>
              <li class="contact-list">
                <b>
                  <i
                    class="fa fa-passport me-2"
                    data-fa-transform="grow-2"
                    aria-hidden="true"
                  ></i>
                  ${escapeHtml(STATIC_CONTACT.passportLabel)}
                </b>
              </li>
            </ul>
          </div>
          <div class="ms-md-auto mt-2 info-right header-content">
            <ul class="list-unstyled">
${contact.profiles.map(renderProfile).join("\n")}
              <li class="mb-2 contact-list">
                <span class="badge">
                  <a
                    href="${escapeHtml(STATIC_CONTACT.alternateCvHref)}"
                    target="_blank"
                    rel="noopener"
                  >
                    <i class="fas fa-file-image me-2" aria-hidden="true"></i>
                    ${escapeHtml(STATIC_CONTACT.alternateCvLabel)}
                  </a>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>

    <main class="container-fluid">
      <div class="resume-layout">
        <div class="resume-main">
${renderSimpleSection("Summary", summary, { id: "summary", sectionClasses: "content mt-2" })}
          <section class="content" id="experience">
            <h2 class="section-title">Experience</h2>

${roles.map(renderRole).join("\n\n")}
          </section>

${renderEarlierCareer(earlierCareerSection)}

${renderEducation(educationSection)}
        </div>

        <aside class="resume-sidebar">
${renderSimpleSection(leadershipFocusSection.title, leadershipFocus, {
  id: "leadership-focus",
  sectionClasses: "content sidebar-card mt-2",
  listClassName: "role-bullets compact-list"
})}

${renderSimpleSection(communitySection.title, community, {
  id: "community",
  sectionClasses: "content sidebar-card",
  listClassName: "role-bullets compact-list",
  introClassName: "sidebar-intro"
})}

${renderSimpleSection(technicalFoundationsSection.title, technicalFoundations, {
  id: "technical-foundations",
  sectionClasses: "content sidebar-card"
})}
        </aside>
      </div>
    </main>
  </body>
</html>
`;
}

async function main() {
  const markdown = await fs.readFile(sourcePath, "utf8");
  const sections = splitSections(markdown);

  if (sections.length === 0) {
    throw new Error("No sections found in resume_content_staffplus.md");
  }

  const html = buildHtml(sections);
  await fs.writeFile(outputPath, html);
  console.log(`Regenerated ${path.relative(repoRoot, outputPath)} from ${path.relative(repoRoot, sourcePath)}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
