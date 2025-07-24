import AuthService from "@/app/lib/AuthService";
import {router} from "expo-router";

export const onUploadClick = async (setShowUploadScreen: (arg0: (prevState: any) => boolean) => any) => {
    const isLoggedIn = await AuthService.isTokenExpired()
    if (!isLoggedIn) {
        let isAuthRefreshed: boolean = await AuthService.refreshAuthToken()
        if (!isAuthRefreshed) return router.push("/auth/login")
    }
    return setShowUploadScreen((prevState) => !prevState)
}