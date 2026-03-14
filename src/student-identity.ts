import type { StudentReference } from "./types";

type StudentIdentityLike = Pick<StudentReference, "classroom" | "number" | "name"> & {
  studentId?: string;
};

export function hasStudentLookupIdentity(student: StudentIdentityLike): boolean {
  return [
    student.classroom,
    student.number,
    student.name,
  ].some((value) => value.trim().length > 0);
}

export function buildNormalizedStudentLookupKey(parts: readonly string[]): string {
  const [classroom = "", number = "", ...rest] = parts;
  const name = rest.join("|");

  return [
    normalizeStudentClassroomValue(classroom),
    normalizeStudentNumberValue(number),
    normalizeStudentNameValue(name),
  ].join("|");
}

export function normalizeStudentClassroomValue(value: string): string {
  const normalized = normalizeIdentityText(value);
  if (!normalized) {
    return "";
  }

  const noSpace = normalized.replace(/\s+/g, "");
  const gradeClassMatch = noSpace.match(/^(\d+)학년(\d+)반$/)
    || noSpace.match(/^(\d+)[-/](\d+)$/);
  if (gradeClassMatch) {
    return `${stripLeadingZeroes(gradeClassMatch[1])}-${stripLeadingZeroes(gradeClassMatch[2])}`;
  }

  const spacedGradeClassMatch = normalized.match(/^(\d+)\s+(\d+)$/);
  if (spacedGradeClassMatch) {
    return `${stripLeadingZeroes(spacedGradeClassMatch[1])}-${stripLeadingZeroes(spacedGradeClassMatch[2])}`;
  }

  const classOnlyMatch = noSpace.match(/^(\d+)반$/) || noSpace.match(/^(\d+)$/);
  if (classOnlyMatch) {
    return `class-${stripLeadingZeroes(classOnlyMatch[1])}`;
  }

  return noSpace;
}

export function normalizeStudentNumberValue(value: string): string {
  const normalized = normalizeIdentityText(value);
  if (!normalized) {
    return "";
  }

  const compact = normalized.replace(/\s+/g, "").replace(/번$/, "");
  if (/^0*\d+$/.test(compact)) {
    return stripLeadingZeroes(compact);
  }

  return compact;
}

export function normalizeStudentNameValue(value: string): string {
  return normalizeIdentityText(value).replace(/\s+/g, "");
}

export function getStudentLookupKey(student: StudentIdentityLike): string | null {
  if (!hasStudentLookupIdentity(student)) {
    return null;
  }

  return buildNormalizedStudentLookupKey([
    student.classroom,
    student.number,
    student.name,
  ]);
}

export function getStudentNumberNameKey(student: StudentIdentityLike): string | null {
  const number = normalizeStudentNumberValue(student.number);
  const name = normalizeStudentNameValue(student.name);
  if (!number || !name) {
    return null;
  }

  return [number, name].join("|");
}

export function hasSameStudentIdentity(
  left: StudentIdentityLike,
  right: StudentIdentityLike,
): boolean {
  const leftKey = getStudentLookupKey(left);
  const rightKey = getStudentLookupKey(right);
  if (leftKey && rightKey && leftKey === rightKey) {
    return true;
  }

  const leftNumberNameKey = getStudentNumberNameKey(left);
  const rightNumberNameKey = getStudentNumberNameKey(right);
  if (!leftNumberNameKey || !rightNumberNameKey || leftNumberNameKey !== rightNumberNameKey) {
    return false;
  }

  const leftClassroom = normalizeStudentClassroomValue(left.classroom);
  const rightClassroom = normalizeStudentClassroomValue(right.classroom);
  return !leftClassroom || !rightClassroom || leftClassroom === rightClassroom;
}

export function normalizeStudentLookupKeyString(value: string): string {
  return buildNormalizedStudentLookupKey(value.split("|"));
}

function normalizeIdentityText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function stripLeadingZeroes(value: string): string {
  return String(Number(value));
}
