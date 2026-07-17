"use server";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DESC_MAX = 150;

export async function generateActionDescription({
  title,
  background,
  objectives,
}: {
  title: string;
  background: string;
  objectives: string;
}): Promise<{ description?: string; error?: string }> {
  if (!title.trim() || !background.trim() || !objectives.trim()) {
    return { error: "Judul action, latar belakang, dan tujuan harus diisi." };
  }

  const apiKey = process.env.OPENAI_KEY;
  if (!apiKey) {
    return { error: "OPENAI_KEY belum diatur di environment." };
  }

  try {
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 100,
        messages: [
          {
            role: "system",
            content:
              "Kamu membantu menulis deskripsi singkat untuk action item kolaborasi lintas sektor dalam Bahasa Indonesia. Balas HANYA dengan teks deskripsi (tanpa tanda kutip, tanpa awalan), padat dan jelas, maksimal 150 karakter.",
          },
          {
            role: "user",
            content: `Judul: ${title}\nLatar Belakang: ${background}\nTujuan / Output: ${objectives}\n\nTulis deskripsi singkat (maksimal 150 karakter) yang merangkum action item ini.`,
          },
        ],
      }),
    });

    if (!res.ok) {
      console.error("OpenAI error:", res.status, await res.text());
      return { error: "Gagal menghasilkan deskripsi. Coba lagi." };
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return { error: "Gagal menghasilkan deskripsi. Coba lagi." };
    }

    return { description: text.slice(0, DESC_MAX) };
  } catch (err) {
    console.error("OpenAI request failed:", err);
    return { error: "Gagal menghasilkan deskripsi. Coba lagi." };
  }
}

export async function generateActionSkills({
  title,
  background,
  objectives,
  description,
}: {
  title: string;
  background: string;
  objectives: string;
  description: string;
}): Promise<{ skills?: string[]; error?: string }> {
  if (!title.trim() || !background.trim() || !objectives.trim()) {
    return { error: "Judul action, latar belakang, dan tujuan harus diisi." };
  }

  const apiKey = process.env.OPENAI_KEY;
  if (!apiKey) {
    return { error: "OPENAI_KEY belum diatur di environment." };
  }

  try {
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        max_tokens: 200,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              'Kamu membantu menyarankan keahlian (skill) yang dibutuhkan untuk sebuah action item kolaborasi lintas sektor. Balas HANYA dalam format JSON: {"skills": ["Skill1", "Skill2", ...]}. Setiap skill singkat (1-3 kata), dalam Bahasa Indonesia, maksimal 6 skill, tanpa duplikat.',
          },
          {
            role: "user",
            content: `Judul: ${title}\nLatar Belakang: ${background}\nTujuan / Output: ${objectives}\nDeskripsi: ${description || "-"}\n\nSarankan keahlian yang paling relevan dibutuhkan untuk action item ini.`,
          },
        ],
      }),
    });

    if (!res.ok) {
      console.error("OpenAI error:", res.status, await res.text());
      return { error: "Gagal menyarankan keahlian. Coba lagi." };
    }

    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content?.trim();
    if (!raw) {
      return { error: "Gagal menyarankan keahlian. Coba lagi." };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { error: "Gagal menyarankan keahlian. Coba lagi." };
    }

    const rawSkills = (parsed as { skills?: unknown })?.skills;
    if (!Array.isArray(rawSkills)) {
      return { error: "Gagal menyarankan keahlian. Coba lagi." };
    }

    const skills = rawSkills
      .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
      .map((s) => s.trim())
      .slice(0, 8);

    if (skills.length === 0) {
      return { error: "Gagal menyarankan keahlian. Coba lagi." };
    }

    return { skills };
  } catch (err) {
    console.error("OpenAI request failed:", err);
    return { error: "Gagal menyarankan keahlian. Coba lagi." };
  }
}
