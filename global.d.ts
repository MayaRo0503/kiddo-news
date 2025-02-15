declare module "bcrypt";
declare module "jsonwebtoken";
declare module "@heroicons/react/outline";

declare module "yup" {
  interface StringSchema {
    customEmail(message?: string): this;
  }
  interface NumberSchema {
    customTimeLimit(message?: string): this;
  }
  interface DateSchema {
    customChildBirthDate(message?: string): this;
  }
  interface StringSchema {
    customPassword(message?: string): this;
  }
}
export {};
