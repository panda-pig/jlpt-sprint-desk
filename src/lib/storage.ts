import type { GeneratedPlan, PlanEdits, PlanSettings, Profile, StudyRecord } from "./types";
import { STORAGE_KEYS } from "./constants";
import { readJSON, writeJSON, todayISO } from "./utils";

export function scopedKey(profileId: string, suffix: string): string {
  return `jlptSprintDesk:${profileId}:${suffix}`;
}

export function getProfiles(): Profile[] {
  return readJSON<Profile[]>(STORAGE_KEYS.profiles, []);
}

export function saveProfiles(profiles: Profile[]): void {
  writeJSON(STORAGE_KEYS.profiles, profiles);
}

export function getActiveProfileId(): string | null {
  return readJSON<string | null>(STORAGE_KEYS.activeProfile, null);
}

export function setActiveProfileId(id: string): void {
  writeJSON(STORAGE_KEYS.activeProfile, id);
}

export function getPlanSettings(profileId: string): PlanSettings {
  return readJSON<PlanSettings>(scopedKey(profileId, "planSettings"), {} as PlanSettings);
}

export function savePlanSettings(settings: PlanSettings, profileId: string): void {
  writeJSON(scopedKey(profileId, "planSettings"), settings);
}

export function getGeneratedPlan(profileId: string): GeneratedPlan | null {
  const plan = readJSON<GeneratedPlan | null>(scopedKey(profileId, "generatedPlan"), null);
  if (!plan || !Array.isArray(plan.dailyPlan)) return null;
  return plan;
}

export function saveGeneratedPlan(plan: GeneratedPlan, profileId: string): void {
  writeJSON(scopedKey(profileId, "generatedPlan"), plan);
}

export function getPlanEdits(profileId: string): PlanEdits {
  const edits = readJSON<PlanEdits>(scopedKey(profileId, "planEdits"), {});
  return edits && typeof edits === "object" && !Array.isArray(edits) ? edits : {};
}

export function savePlanEdits(edits: PlanEdits, profileId: string): void {
  writeJSON(scopedKey(profileId, "planEdits"), edits || {});
}

export function getRecords(profileId: string): StudyRecord[] {
  const records = readJSON<StudyRecord[]>(scopedKey(profileId, "records"), []);
  return Array.isArray(records) ? records : [];
}

export function saveRecords(records: StudyRecord[], profileId: string): void {
  writeJSON(scopedKey(profileId, "records"), Array.isArray(records) ? records : []);
}

export function createProfile(name: string): Profile {
  const profile: Profile = {
    id: `profile-${Date.now().toString(36)}`,
    name,
    createdAt: todayISO(),
    updatedAt: todayISO(),
  };
  const profiles = getProfiles();
  profiles.push(profile);
  saveProfiles(profiles);
  return profile;
}

export function deleteProfile(profileId: string): void {
  const profiles = getProfiles().filter((p) => p.id !== profileId);
  saveProfiles(profiles);
  if (getActiveProfileId() === profileId) {
    setActiveProfileId(profiles[0]?.id || "");
  }
}

export function updateProfileName(profileId: string, name: string): void {
  const profiles = getProfiles();
  const profile = profiles.find((p) => p.id === profileId);
  if (profile) {
    profile.name = name;
    profile.updatedAt = todayISO();
    saveProfiles(profiles);
  }
}
