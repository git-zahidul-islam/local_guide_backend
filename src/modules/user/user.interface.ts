import { UserRole } from "../../generated/enums"

export type UserCreateInput = {
    name: string,
    email: string,
    password: string,
    profilePhoto?: string | null,
    role: UserRole

}