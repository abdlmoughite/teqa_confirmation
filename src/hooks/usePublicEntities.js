import { useEffect, useMemo, useState } from "react";

import { resolvePublicEntity } from "../api/auth";

const normalizeType = (type) => {
  if (!type) return "";
  if (type === "AGENCY") return "AGENCY_OWNER";
  if (type === "AGENT") return "AGENCY_AGENT";
  return String(type).toUpperCase();
};

const entityKey = (type, id) => {
  const normalizedType = normalizeType(type);
  const normalizedId = id ? String(id) : "";
  if (!normalizedType || !normalizedId) return null;
  return `${normalizedType}:${normalizedId}`;
};

export const makePublicEntity = (type, id) => {
  const key = entityKey(type, id);
  if (!key) return null;
  return { type: normalizeType(type), id: String(id), key };
};

export const formatEntityType = (type) =>
  String(type || "User").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

export const shortId = (value) => {
  if (!value) return "";
  const text = String(value);
  return text.length > 12 ? `${text.slice(0, 12)}...` : text;
};

export const genericEntityName = (type) => {
  const normalizedType = normalizeType(type);
  if (normalizedType === "STORE") return "Store";
  if (normalizedType === "AGENCY_OWNER") return "Agency";
  if (normalizedType === "AGENCY_AGENT") return "Agent";
  return formatEntityType(type);
};

export const usePublicEntities = (entities) => {
  const uniqueEntities = useMemo(() => {
    const map = new Map();
    (entities || []).forEach((entity) => {
      const normalized = makePublicEntity(entity?.type, entity?.id);
      if (normalized) map.set(normalized.key, normalized);
    });
    return Array.from(map.values());
  }, [entities]);

  const [profiles, setProfiles] = useState({});

  useEffect(() => {
    let cancelled = false;
    const missing = uniqueEntities.filter((entity) => !Object.prototype.hasOwnProperty.call(profiles, entity.key));

    if (!missing.length) return undefined;

    Promise.all(
      missing.map(async (entity) => {
        try {
          const response = await resolvePublicEntity(entity);
          return [entity.key, response.data];
        } catch {
          return [entity.key, null];
        }
      })
    ).then((entries) => {
      if (cancelled) return;
      setProfiles((previous) => ({
        ...previous,
        ...Object.fromEntries(entries),
      }));
    });

    return () => {
      cancelled = true;
    };
  }, [profiles, uniqueEntities]);

  const getEntity = (type, id) => {
    const key = entityKey(type, id);
    return key ? profiles[key] : null;
  };

  const getEntityName = (type, id, fallback) => {
    const entity = getEntity(type, id);
    return entity?.display_name || fallback || genericEntityName(type);
  };

  const getEntitySubtitle = (type, id, fallback) => {
    const entity = getEntity(type, id);
    return entity?.subtitle || fallback || genericEntityName(type);
  };

  const getEntityAvatar = (type, id) => getEntity(type, id)?.avatar || null;

  return {
    profiles,
    getEntity,
    getEntityName,
    getEntitySubtitle,
    getEntityAvatar,
  };
};
