import { useCallback, useMemo, useState } from 'react';
import { HistorialAnalisis } from '@/types';
import { FirestoreService } from '@/utils/firestoreService';
import {
  AnalisisLocalEntry,
  removeLocalAnalysis,
  upsertLocalAnalysis,
} from '@/utils/localAnalysis';

interface GuardarAnalisisEstado {
  guardando: boolean;
  guardadoLocal: boolean;
  guardadoRemoto: boolean;
  yaExistiaRemoto: boolean;
  error: string | null;
}

interface GuardarAnalisisResultado {
  success: boolean;
  alreadyExists: boolean;
  confirmed: boolean;
  documentId: string | null;
  result?: any;
  error?: unknown;
}

interface PrepararBorradorResultado {
  claveUnica: string;
  entries: AnalisisLocalEntry[];
}

const normalizarCampo = (valor: string | undefined | null): string => {
  if (!valor) return 'Sin especificar';
  const trimmed = valor.trim();
  return trimmed === '' ? 'Sin especificar' : trimmed;
};

const generarClaveUnicaDesdeAnalisis = (analisis: HistorialAnalisis): string => {
  return [
    normalizarCampo(analisis.unidadDeNegocio || analisis.unidad),
    normalizarCampo(analisis.planta),
    normalizarCampo(analisis.turno),
    normalizarCampo(analisis.area),
    normalizarCampo(analisis.puesto),
    normalizarCampo(analisis.flujo),
  ].join('|');
};

export const useGuardarAnalisis = () => {
  const [estado, setEstado] = useState<GuardarAnalisisEstado>({
    guardando: false,
    guardadoLocal: false,
    guardadoRemoto: false,
    yaExistiaRemoto: false,
    error: null,
  });
  const [analisisActual, setAnalisisActual] = useState<HistorialAnalisis | null>(null);
  const [claveLocal, setClaveLocal] = useState<string | null>(null);
  const [ultimoDocumentoId, setUltimoDocumentoId] = useState<string | null>(null);

  const limpiarEstadoError = useCallback(() => {
    setEstado((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  const prepararBorrador = useCallback(
    async (analisis: HistorialAnalisis): Promise<PrepararBorradorResultado> => {
      const claveUnica = generarClaveUnicaDesdeAnalisis(analisis);
      const entries = await upsertLocalAnalysis(analisis, claveUnica);

      setAnalisisActual(analisis);
      setClaveLocal(claveUnica);
      setUltimoDocumentoId(FirestoreService.getDocumentIdForAnalysis(analisis));
      setEstado((prev) => ({
        ...prev,
        guardadoLocal: true,
        guardadoRemoto: false,
        yaExistiaRemoto: false,
        error: null,
      }));

      return { claveUnica, entries };
    },
    []
  );

  const verificarExistencia = useCallback(
    async (analisis?: HistorialAnalisis): Promise<{ existe: boolean; documentId: string | null }> => {
      const analisisEvaluado = analisis ?? analisisActual;
      if (!analisisEvaluado) {
        return { existe: false, documentId: null };
      }

      const documentId = FirestoreService.getDocumentIdForAnalysis(analisisEvaluado);
      try {
        const documento = await FirestoreService.getNuevaEstructuraDocument(documentId);
        const existe = !!documento;

        setEstado((prev) => ({
          ...prev,
          guardadoRemoto: existe ? true : prev.guardadoRemoto,
          yaExistiaRemoto: existe,
          error: null,
        }));
        setUltimoDocumentoId(documentId);

        if (existe && claveLocal) {
          await removeLocalAnalysis(claveLocal);
          setClaveLocal(null);
          setEstado((prev) => ({
            ...prev,
            guardadoLocal: false,
          }));
        }

        return { existe, documentId };
      } catch (error: any) {
        setEstado((prev) => ({
          ...prev,
          error: error?.message || 'Error al verificar análisis en Firestore',
        }));
        return { existe: false, documentId };
      }
    },
    [analisisActual, claveLocal]
  );

  const guardarAnalisis = useCallback(
    async (
      analisis?: HistorialAnalisis,
      { verificar = true }: { verificar?: boolean } = {}
    ): Promise<GuardarAnalisisResultado> => {
      const analisisAGuardar = analisis ?? analisisActual;
      if (!analisisAGuardar) {
        const mensaje = 'No hay un análisis disponible para guardar.';
        setEstado((prev) => ({
          ...prev,
          error: mensaje,
        }));
        return {
          success: false,
          alreadyExists: false,
          confirmed: false,
          documentId: null,
          error: new Error(mensaje),
        };
      }

      const documentId = FirestoreService.getDocumentIdForAnalysis(analisisAGuardar);
      setAnalisisActual(analisisAGuardar);
      setUltimoDocumentoId(documentId);
      setEstado((prev) => ({
        ...prev,
        guardando: true,
        error: null,
      }));

      try {
        const documentoExistente = await FirestoreService.getNuevaEstructuraDocument(documentId);
        if (documentoExistente) {
          if (claveLocal) {
            await removeLocalAnalysis(claveLocal);
            setClaveLocal(null);
          }

          setEstado((prev) => ({
            ...prev,
            guardando: false,
            guardadoLocal: false,
            guardadoRemoto: true,
            yaExistiaRemoto: true,
            error: null,
          }));

          return {
            success: true,
            alreadyExists: true,
            confirmed: true,
            documentId,
            result: documentoExistente,
          };
        }

        const result = await FirestoreService.saveAnalysis(analisisAGuardar);

        let confirmed = true;
        if (verificar) {
          try {
            const verificacion = await FirestoreService.getNuevaEstructuraDocument(documentId);
            confirmed = !!verificacion;
          } catch (verificacionError) {
            confirmed = false;
            console.warn('⚠️ Error al verificar análisis recién guardado:', verificacionError);
          }
        }

        if (claveLocal) {
          await removeLocalAnalysis(claveLocal);
          setClaveLocal(null);
        }

        setEstado({
          guardando: false,
          guardadoLocal: false,
          guardadoRemoto: true,
          yaExistiaRemoto: false,
          error: null,
        });

        return {
          success: true,
          alreadyExists: false,
          confirmed,
          documentId,
          result,
        };
      } catch (error: any) {
        const mensaje = error?.message || 'Error al guardar el análisis en Firestore.';
        setEstado((prev) => ({
          ...prev,
          guardando: false,
          error: mensaje,
        }));

        return {
          success: false,
          alreadyExists: false,
          confirmed: false,
          documentId,
          error,
        };
      }
    },
    [analisisActual, claveLocal]
  );

  const limpiarAnalisisLocal = useCallback(async () => {
    if (claveLocal) {
      await removeLocalAnalysis(claveLocal);
      setClaveLocal(null);
    }
    setAnalisisActual(null);
    setEstado((prev) => ({
      ...prev,
      guardadoLocal: false,
    }));
  }, [claveLocal]);

  const resumen = useMemo(
    () => ({
      estado,
      analisisActual,
      claveLocal,
      ultimoDocumentoId,
    }),
    [estado, analisisActual, claveLocal, ultimoDocumentoId]
  );

  return {
    ...resumen,
    prepararBorrador,
    guardarAnalisis,
    verificarExistencia,
    limpiarAnalisisLocal,
    limpiarEstadoError,
  };
};

export type UseGuardarAnalisisHook = ReturnType<typeof useGuardarAnalisis>;



