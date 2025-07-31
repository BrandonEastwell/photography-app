import AuthService from "@/app/lib/AuthService";
import {useRouter} from "expo-router";
import {useState} from "react";
import {useAuth} from "@/app/lib/AuthContext";

export default function useUpload() {
    const [showUploadScreen, setShowUploadScreen] = useState<boolean>(false)
    const { isAuthenticated } = useAuth();
    const router = useRouter()

    const onUploadClick = async () => {
        const isUserAuthenticated = await isAuthenticated()
        if (!isUserAuthenticated) {
            let isAuthRefreshed: boolean = await AuthService.refreshAuthToken()
            if (!isAuthRefreshed) return router.push("/auth/login")
        }
        return setShowUploadScreen((prevState) => !prevState)
    }

    return { showUploadScreen, onUploadClick, setShowUploadScreen }
}