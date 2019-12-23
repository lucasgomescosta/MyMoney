import React, { useState } from 'react';
import firebase from '../../services/firebaseConnection';
import { Keyboard, Picker, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Container, Input, PickerItem, SubmitButton, SubmitText } from './styles';

export default function New({ navigation }){
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('receita');

  function handleSubmit(){
    Keyboard.dismiss();
    if(isNaN(parseFloat(valor))){
      alert('Preencha todos os campos!');
      return;
    }

    Alert.alert(
      'Confirmando dados',
      `Tipo ${tipo} - Valor: ${parseFloat(valor)}`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Continuar',
          onPress: () =>  handleAdd()
        }
      ]
    )
    
  }


  async function handleAdd(){
    let uid = firebase.auth().currentUser.uid;

    let key = firebase.database().ref('historico').child(uid).push().key;
    await firebase.database().ref('historico').child(uid).child(key).set({
      tipo: tipo,
      valor: parseFloat(valor),
      date: new Date().toLocaleDateString(),
    });

    //Atualizar nosso saldo.
    let user = firebase.database().ref('users').child(uid);
    await user.once('value').then((snapshot) => {
      let saldo = parseFloat(snapshot.val().saldo);

      tipo === 'despesa' ? saldo -= parseFloat(valor) : saldo +=  parseFloat(valor);

      user.set({
        saldo:saldo
      });
    });
    setValor('');
    Keyboard.dismiss();
    navigation.navigate('Dashboard');

  }

  return(
    <Container>
      <Input
        placeholder="Valor desejado"
        keyboardType="numeric"
        value={valor}
        onChangeText={ (valor)=> setValor(valor) }
        returnKeyType="next"
        onSubmitEditing={ () => Keyboard.dismiss() }
      />

      <PickerItem
        selectedValue={tipo} 
        onValueChange={ (itemValue, itemIndex)=> setTipo(itemValue) }
      >
         <Picker.Item label="Receita" value="receita" /> 
         <Picker.Item label="Despesa" value="despesa" /> 
      </PickerItem>


      <SubmitButton onPress={handleSubmit}>
        <SubmitText>Registrar</SubmitText>
      </SubmitButton>

    </Container>
  )
}

New.navigationOptions = {
  tabBarLabel: 'Registrar',
  tabBarIcon: ({ tintColor }) => (
    <Icon name="edit" size={24} color={tintColor} />
  )
};

