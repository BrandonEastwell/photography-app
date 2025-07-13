import {View, Text, TextInput, StyleSheet, TouchableOpacity} from "react-native";
import {useRouter} from "expo-router";
import React from 'react';
import { Formik } from 'formik';
import * as yup from 'yup';

export default function Register() {
    const router = useRouter()

    const loginValidationSchema = yup.object().shape({
        username: yup
            .string()
            .email('Please enter a valid username')
            .required('Username is required'),
        password: yup
            .string()
            .min(6, ({ min }) => `Password must be at least ${min} characters`)
            .required('Password is required'),
    });

    const formSubmit = (values: {
        username: string
        password: string
    }) => {

    }

    return (
        <View style={{backgroundColor: '#181a1b', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <View style={styles.container}>
                <Text style={styles.title}>Photography App</Text>
                <Formik
                    validationSchema={loginValidationSchema}
                    initialValues={{ username: '', password: '' }}
                    onSubmit={formSubmit}
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
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Username"
                                    onChangeText={handleChange('username')}
                                    onBlur={handleBlur('username')}
                                    value={values.username}
                                />
                            </View>
                            {errors.username && touched.username && (
                                <Text style={styles.errorText}>{errors.username}</Text>
                            )}
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    secureTextEntry
                                    onChangeText={handleChange('password')}
                                    onBlur={handleBlur('password')}
                                    value={values.password}
                                />
                            </View>
                            {errors.password && touched.password && (
                                <Text style={styles.errorText}>{errors.password}</Text>
                            )}
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => handleSubmit}
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
        fontWeight: 'bold',
        color: 'rgba(229,229,229,0.97)',
        alignSelf: "center"
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 50,
        backgroundColor: '#f1f1f1',
        borderRadius: 6,
        paddingHorizontal: 10,
        marginBottom: 10,
        outline: "none"
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 20,
        color: '#f1f1f1',
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
        fontSize: 18,
    },
    signUp: {
        color: '#f1f1f1',
        alignSelf: "center"
    },
    signUpLink: {
        color: '#1E90FF',
    },
    errorText: {
        color: 'red',
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
});