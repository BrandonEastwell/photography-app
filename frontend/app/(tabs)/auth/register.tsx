import {View, Text, StyleSheet, TouchableOpacity, Platform} from "react-native";
import {useRouter} from "expo-router";
import React from 'react';
import { Formik } from 'formik';
import * as yup from 'yup';
import Constants from 'expo-constants';
import FormInput from "@/app/components/FormInput";
import {useMessage} from "@/app/lib/MessagingContext";
const apiUrl = Constants.expoConfig?.extra?.API_URL;

export default function Register() {
    const { message, setMessage } = useMessage()
    const router = useRouter()

    const loginValidationSchema = yup.object().shape({
        firstName: yup
            .string()
            .required('First name is required'),
        lastName: yup
            .string()
            .required('Last name is required'),
        username: yup
            .string()
            .required('Username is required'),
        password: yup
            .string()
            .min(6, ({ min }) => `Password must be at least ${min} characters`)
            .required('Password is required'),
    });

    const formSubmit = async (values: { firstName: string, lastName: string,
        username: string, password: string }) => {

        const formData = new FormData()
        formData.append("firstName", values.firstName)
        formData.append("lastName", values.lastName)
        formData.append("username", values.username)
        formData.append("password", values.password)

        let res = await fetch(`${apiUrl}/api/account/register`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Platform": Platform.OS
            },
            body: formData
        })

        let data = await res.json()
        if (!data.success) {
            setMessage({ message: data.error, error: true })
            return
        }

        setMessage({ message: data.message, error: false })
        setTimeout(() => {
            router.replace('/auth/login')
        }, 2000)
    }

    return (
        <View style={{backgroundColor: '#181a1b', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <View style={styles.container}>
                <Text style={styles.title}>Photography App</Text>
                <Formik
                    validationSchema={loginValidationSchema}
                    initialValues={{ firstName: '', lastName: '', username: '', password: '' }}
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
                            <FormInput placeholder={"First name"} onChangeText={handleChange('firstName')}
                                       onBlur={handleBlur('firstName')} value={values.firstName} secure={false}></FormInput>
                            {errors.firstName && touched.firstName && (
                                <Text style={styles.errorText}>{errors.firstName}</Text>
                            )}
                            <FormInput placeholder={"Last name"} onChangeText={handleChange('lastName')}
                                       onBlur={handleBlur('lastName')} value={values.lastName} secure={false}></FormInput>
                            {errors.lastName && touched.lastName && (
                                <Text style={styles.errorText}>{errors.lastName}</Text>
                            )}
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
                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleSubmit}
                                disabled={!isValid}
                            >
                                <Text style={styles.buttonText}>Register</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push('/auth/login')}>
                                <Text style={styles.signUp}>
                                    Already have an account? <Text style={styles.signUpLink}>Sign In</Text>
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