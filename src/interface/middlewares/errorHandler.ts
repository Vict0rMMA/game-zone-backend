import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    const errors = err.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
    res.status(400).json({ message: 'Datos inválidos', errors });
    return;
  }

  const notFoundMessages = ['no encontrad', 'not found'];
  if (notFoundMessages.some(m => err.message.toLowerCase().includes(m))) {
    res.status(404).json({ message: err.message });
    return;
  }

  const conflictMessages = ['ya existe', 'already exists'];
  if (conflictMessages.some(m => err.message.toLowerCase().includes(m))) {
    res.status(409).json({ message: err.message });
    return;
  }

  if (err.message === 'Credenciales inválidas') {
    res.status(401).json({ message: err.message });
    return;
  }

  res.status(500).json({ message: 'Error interno del servidor' });
}
