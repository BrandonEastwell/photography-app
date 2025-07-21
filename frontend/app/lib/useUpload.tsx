import AuthService from "@/app/lib/AuthService";
import {useRouter} from "expo-router";
import {useState} from "react";

export default function useUpload() {
    const [showUploadScreen, setShowUploadScreen] = useState<boolean>(false)
    const router = useRouter()

    const onUploadClick = async () => {
        const isLoggedIn = await AuthService.isUserLoggedIn()
        if (!isLoggedIn) {
            let isAuthRefreshed: boolean = await AuthService.refreshAuthToken()
            if (!isAuthRefreshed) return router.push("/auth/login")
        }
        return setShowUploadScreen((prevState) => !prevState)
    }

    return { showUploadScreen, onUploadClick, setShowUploadScreen }
}