import {View, Text, StyleSheet, TouchableOpacity} from "react-native";
import {useRouter} from "expo-router";
import React, {useState} from 'react';
import {Formik} from 'formik';
import * as yup from 'yup';
import {useAuth} from "@/app/lib/AuthContext";
import Constants from 'expo-constants';
import AuthService from "@/app/lib/AuthService";
import FormInput from "@/app/components/FormInput";
import {getReqHeaders} from "@/app/lib/Helpers";
import {useMessage} from "@/app/lib/MessagingContext";
const apiUrl = Constants.expoConfig?.extra?.API_URL;

export default function Login() {
    const { message, setMessage } = useMessage()
    const { login } = useAuth()
    const router = useRouter()

    const loginValidationSchema = yup.object().shape({
        username: yup
            .string()
            .required('Username is required'),
        password: yup
            .string()
            .min(6, ({ min }) => `Password must be at least ${min} characters`)
            .required('Password is required'),
    });

    const formSubmit = async (values: { username: string; password: string; }) => {
        const formData = new FormData()
        formData.append("username", values.username)
        formData.append("password", values.password)

        const headers = await getReqHeaders()
        let res = await fetch(`${apiUrl}/api/account/login`, {
            method: "POST",
            headers,
            credentials: "include",
            body: formData
        })

        let data = await res.json()
        if (!data.success) {
            setMessage({ message: data.error, error: true })
            if (data.error === "Session expired. Please try again.") await AuthService.createSession()
            return
        }

        setMessage({ message: data.message, error: false })
        console.log(data.auth_token_exp)
        await AuthService.saveAuthToken(data.auth_token, data.auth_token_exp)
        login({ username: data.username, userId: data.user_id })

        setTimeout(() => {
            return router.push({
                pathname: `/[username]`,
                params: {
                    username: encodeURIComponent(data.username),
                }
            })
        }, 2000)
    }

    return (
        <View style={{backgroundColor: '#181a1b', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <View style={styles.container}>
                <Text style={styles.title}>Photography App</Text>
                <Formik
                    validationSchema={loginValidationSchema}
                    initialValues={{ username: '', password: '' }}
                    onSubmit={values => formSubmit(values)}
                >
                    {({
                          handleChange,
                          handleBlur,
                          handleSubmit,
                          values,
                          errors,
                          touched,
                          isValid,
                      }) => (
                        <>
                            <FormInput placeholder={"Username"} onChangeText={handleChange('username')}
                                       onBlur={handleBlur('username')} value={values.username} secure={false}></FormInput>
                            {errors.username && touched.username && (
                                <Text style={styles.errorText}>{errors.username}</Text>
                            )}
                            <FormInput placeholder={"Password"} onChangeText={handleChange('password')}
                                       onBlur={handleBlur('password')} value={values.password} secure={true}></FormInput>
                            {errors.password && touched.password && (
                                <Text style={styles.errorText}>{errors.password}</Text>
                            )}
                            <TouchableOpacity style={{ width: "100%" }} onPress={() => null}>
                                <Text style={styles.forgotPassword}>Forgot Password?</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleSubmit}
                                disabled={!isValid}
                            >
                                <Text style={styles.buttonText}>Login</Text>
                            </TouchableOpacity>
                            {error && !message && (
                                <Text style={{ color: 'red', alignSelf: 'center', marginBottom: 20, fontFamily: "SpaceMono-Regular" }}>{error}</Text>
                            )}
                            {message && (
                                <Text style={{ color: '#3091fc', alignSelf: 'center', marginBottom: 20, fontFamily: "SpaceMono-Regular" }}>{message}</Text>
                            )}
                            <TouchableOpacity onPress={() => router.push('/auth/register')}>
                                <Text style={styles.signUp}>
                                    Don't have an account? <Text style={styles.signUpLink}>Sign Up</Text>
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </Formik>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        width: "100%",
        maxWidth: 400
    },
    title: {
        fontSize: 32,
        marginBottom: 40,
        fontFamily: "BethEllen-Regular",
        color: 'rgba(229,229,229,0.97)',
        alignSelf: "center"
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 20,
        color: '#f1f1f1',
        fontFamily: "SpaceMono-Regular",
    },
    button: {
        width: '100%',
        height: 45,
        backgroundColor: '#3091fc',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        fontFamily: "SpaceMono-Regular",
        fontSize: 18,
    },
    signUp: {
        color: '#f1f1f1',
        fontFamily: "SpaceMono-Regular",
        alignSelf: "center"
    },
    signUpLink: {
        color: '#1E90FF',
    },
    errorText: {
        color: 'red',
        alignSelf: 'flex-start',
        marginBottom: 10,
        fontFamily: "SpaceMono-Regular",
    },
});