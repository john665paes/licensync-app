import React, { useEffect, useState } from "react";
import { 
    View, 
    Text, 
    ScrollView, 
    StyleSheet, 
    Image, 
    ActivityIndicator, 
    Platform, 
    StatusBar,
    SafeAreaView
} from "react-native";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Toast from 'react-native-toast-message';

// Configurações e Componentes
import { db } from "../../../config/firebase";
import { TEMAS } from "../../../estilos/temas";
import { InputTexto } from "../../../componentes/formulario";
import { Botoes } from "../../../componentes/botoes";
import { BotaoVoltar } from "../../../componentes/botoes/back";
import { BotaoSair } from "../../../componentes/botoes/exit";

// @ts-ignore
import Logo from '../../../assets/imgs/login.png';

// Tipo explícito para os dados do cliente
type ClienteData = {
    empresa: string;
    cnpj: string;
    email: string;
    telefone1: string;
    telefone2: string;
    cep: string;
    numero: string;
    complemento: string;
    endereco: string;
    cidade: string;
    bairro: string;
    uf: string;
};

export default function Editar() {
    const { id } = useLocalSearchParams();
    const clientId = id as string;

    const [loading, setLoading] = useState(true);
    const [initialValues, setInitialValues] = useState<ClienteData>({
        empresa: '', cnpj: '', email: '', telefone1: '', telefone2: '',
        cep: '', numero: '', complemento: '', endereco: '', cidade: '',
        bairro: '', uf: '',
    });

    // Carregar os dados do cliente
    useEffect(() => {
        const fetchClientData = async () => {
            if (!clientId) return;
            try {
                const docRef = doc(db, 'usuarios', clientId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as Partial<ClienteData>;
                    setInitialValues({
                        empresa: data.empresa || '',
                        cnpj: data.cnpj || '',
                        email: data.email || '',
                        telefone1: data.telefone1 || '',
                        telefone2: data.telefone2 || '',
                        cep: data.cep || '',
                        numero: data.numero || '',
                        complemento: data.complemento || '',
                        endereco: data.endereco || '',
                        cidade: data.cidade || '',
                        bairro: data.bairro || '',
                        uf: data.uf || '',
                    });
                } else {
                    Toast.show({ type: 'error', text1: 'Cliente não encontrado' });
                    router.back();
                }
            } catch (error) {
                Toast.show({ type: 'error', text1: 'Erro ao carregar dados' });
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchClientData();
    }, [clientId]);

    const salvarCliente = async (dados: ClienteData) => {
        try {
            const docRef = doc(db, 'usuarios', clientId);
            await updateDoc(docRef, dados);
            Toast.show({ type: 'success', text1: 'Dados atualizados com sucesso!' });
            setTimeout(() => router.back(), 1000);
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Erro ao atualizar os dados' });
            console.error(error);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={TEMAS.colors.verde} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={TEMAS.colors.verde} />
            
            {/* --- HEADER --- */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <BotaoVoltar />
                </View>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Editar Cliente</Text>
                </View>
                <View style={styles.headerRight}>
                    <BotaoSair />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {/* LOGO */}
                <View style={styles.logoContainer}>
                    <Image source={Logo} style={styles.logo} resizeMode="contain" />
                </View>

                <Formik
                    initialValues={initialValues}
                    enableReinitialize
                    validationSchema={Yup.object().shape({
                        empresa: Yup.string().required('Campo obrigatório'),
                        cnpj: Yup.string().required('Campo obrigatório'),
                        email: Yup.string().required('Campo obrigatório').email('Email inválido'),
                        telefone1: Yup.string().required('Campo obrigatório'),
                        cep: Yup.string().required('Campo obrigatório'),
                        numero: Yup.string().required('Campo obrigatório'),
                        cidade: Yup.string().required('Campo obrigatório'),
                        endereco: Yup.string().required('Campo obrigatório'),
                        bairro: Yup.string().required('Campo obrigatório'),
                        uf: Yup.string().required('Campo obrigatório')
                    })}
                    onSubmit={salvarCliente}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, isSubmitting, errors, touched }) => (
                        <View style={styles.formContainer}>
                            
                            <InputTexto 
                                label="Empresa:"
                                onBlur={handleBlur('empresa')}
                                onChangeText={handleChange('empresa')}
                                placeholder="Nome da Empresa"
                                value={values.empresa} 
                            />
                            {touched.empresa && errors.empresa && <Text style={styles.errorText}>{errors.empresa}</Text>}

                            <InputTexto 
                                label="CNPJ:"
                                onBlur={handleBlur('cnpj')}
                                onChangeText={handleChange('cnpj')}
                                placeholder="CNPJ"
                                value={values.cnpj} 
                            />
                            {touched.cnpj && errors.cnpj && <Text style={styles.errorText}>{errors.cnpj}</Text>}

                            <InputTexto 
                                label="Email:"
                                onBlur={handleBlur('email')}
                                onChangeText={handleChange('email')}
                                placeholder="E-mail"
                                readOnly // Se o seu componente suportar, senão use editable={false}
                                value={values.email} 
                            />
                            {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                            {/* LINHA DUPLA: TELEFONES */}
                            <View style={styles.row}>
                                <View style={styles.col}>
                                    <InputTexto
                                        label="Telefone 1:"
                                        onBlur={handleBlur('telefone1')}
                                        onChangeText={handleChange('telefone1')}
                                        placeholder="(00) 0000-0000"
                                        value={values.telefone1} 
                                    />
                                    {touched.telefone1 && errors.telefone1 && <Text style={styles.errorText}>{errors.telefone1}</Text>}
                                </View>
                                <View style={styles.space} />
                                <View style={styles.col}>
                                    <InputTexto
                                        label="Telefone 2:"
                                        onBlur={handleBlur('telefone2')}
                                        onChangeText={handleChange('telefone2')}
                                        placeholder="(Op.)"
                                        value={values.telefone2} 
                                    />
                                </View>
                            </View>

                            <InputTexto 
                                label="Cidade:"
                                onBlur={handleBlur('cidade')}
                                onChangeText={handleChange('cidade')}
                                placeholder="Cidade"
                                value={values.cidade} 
                            />
                            {touched.cidade && errors.cidade && <Text style={styles.errorText}>{errors.cidade}</Text>}

                            <InputTexto 
                                label="Endereço:"
                                onBlur={handleBlur('endereco')}
                                onChangeText={handleChange('endereco')}
                                placeholder="Rua, Avenida..."
                                value={values.endereco} 
                            />
                            {touched.endereco && errors.endereco && <Text style={styles.errorText}>{errors.endereco}</Text>}

                            {/* LINHA DUPLA: CEP E NUMERO */}
                            <View style={styles.row}>
                                <View style={styles.col}>
                                    <InputTexto
                                        label="CEP:"
                                        onBlur={handleBlur('cep')}
                                        onChangeText={handleChange('cep')}
                                        placeholder="00000-000"
                                        value={values.cep} 
                                    />
                                    {touched.cep && errors.cep && <Text style={styles.errorText}>{errors.cep}</Text>}
                                </View>
                                <View style={styles.space} />
                                <View style={styles.col}>
                                    <InputTexto
                                        label="Número:"
                                        onBlur={handleBlur('numero')}
                                        onChangeText={handleChange('numero')}
                                        placeholder="Nº"
                                        value={values.numero} 
                                    />
                                    {touched.numero && errors.numero && <Text style={styles.errorText}>{errors.numero}</Text>}
                                </View>
                            </View>

                            <InputTexto 
                                label="Complemento:"
                                onBlur={handleBlur('complemento')}
                                onChangeText={handleChange('complemento')}
                                placeholder="Apto, Bloco..."
                                value={values.complemento} 
                            />

                            {/* LINHA DUPLA: BAIRRO E UF */}
                            <View style={styles.row}>
                                <View style={styles.col}>
                                    <InputTexto
                                        label="Bairro:"
                                        onBlur={handleBlur('bairro')}
                                        onChangeText={handleChange('bairro')}
                                        placeholder="Bairro"
                                        value={values.bairro} 
                                    />
                                    {touched.bairro && errors.bairro && <Text style={styles.errorText}>{errors.bairro}</Text>}
                                </View>
                                <View style={styles.space} />
                                <View style={styles.col}>
                                    <InputTexto
                                        label="UF:"
                                        onBlur={handleBlur('uf')}
                                        onChangeText={handleChange('uf')}
                                        placeholder="UF"
                                        value={values.uf} 
                                    />
                                    {touched.uf && errors.uf && <Text style={styles.errorText}>{errors.uf}</Text>}
                                </View>
                            </View>

                            <View style={styles.footerButtons}>
                                <Botoes onPress={() => handleSubmit()} disabled={isSubmitting}>
                                    {isSubmitting ? 'Salvando...' : 'Salvar Edição'}
                                </Botoes>
                                
                                <View style={{ height: 10 }} />
                                
                                <Botoes onPress={() => router.back()} bgColor={TEMAS.colors.cinza}>
                                    Cancelar
                                </Botoes>
                            </View>

                        </View>
                    )}
                </Formik>
            </ScrollView>
            
            {/* O Toast precisa ficar na raiz ou no layout principal, mas pode ficar aqui se não tiver outro lugar */}
            <Toast />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // HEADER
    header: {
        width: '100%',
        height: 100,
        paddingTop: Platform.OS === 'android' ? 35 : 50,
        paddingHorizontal: 16,
        paddingBottom: 10,
        backgroundColor: TEMAS.colors.verde,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerLeft: {
        flex: 1,
        alignItems: 'flex-start',
    },
    headerCenter: {
        flex: 4,
        alignItems: 'center',
    },
    headerRight: {
        flex: 1,
        alignItems: 'flex-end',
    },
    headerTitle: {
        color: TEMAS.colors.branco,
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // CONTEÚDO
    scrollContent: {
        paddingBottom: 40,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    logo: {
        width: 150,
        height: 100,
    },
    formContainer: {
        padding: 20,
    },
    // GRID SYSTEM (LINHAS E COLUNAS)
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 5,
    },
    col: {
        flex: 1,
    },
    space: {
        width: 10, // Espaço entre colunas
    },
    // TEXTOS
    errorText: {
        color: 'red', // ou TEMAS.colors.red
        fontSize: 12,
        marginBottom: 10,
        marginLeft: 5,
    },
    footerButtons: {
        marginTop: 20,
    }
});