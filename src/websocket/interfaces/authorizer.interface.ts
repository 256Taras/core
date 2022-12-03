export interface Authorizer {
  passesUser(): boolean;
}
