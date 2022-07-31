import { Module } from '../module.class';
import { ModuleDefinition } from '../interfaces/module-definition.interface';

export const createModule = (data: ModuleDefinition) => {
  const { controllers, channels } = data;

  return new Module(controllers, channels);
};
