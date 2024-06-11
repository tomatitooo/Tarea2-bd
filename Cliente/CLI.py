import requests

API_URL= 'http://localhost:3000/api'

def login(correo,clave):
    response = requests.post(f'{API_URL}/login', json={
        "correo":correo,
        "clave":clave
    })
    return response.json()

def registrar(nombre,correo,clave,desc):
    response = requests.post(f'{API_URL}/registrar', json={
        "nombre":nombre,
        "correo":correo,
        "clave":clave,
        "descripcion":desc
    })
    return response.json()

def obtener_info(correo):
    response = requests.get(f'{API_URL}/informacion/{correo}')
    return response.json() 

def obtener_correosfav(correo):
    response = requests.get(f'{API_URL}/favoritos/{correo}')
    return response.json()


def marcar_favorito(correo, clave, id_correo_favorito):
    response = requests.post(f'{API_URL}/marcarcorreo', json={
        "correo":correo,
        "clave":clave,
        "id_correo_favorito":id_correo_favorito
    })
    return response.json()


def user_id(id):
    response = requests.get(f'{API_URL}/info/{id}')
    return response.json()

def main():
    print("Bienvenido a CommuniKen!")
    print("1.Iniciar sesion")
    print("2.Registrarse")
    n=input("Opcion: ")
    match n:
        case "1":
            correo=input("Correo: ")
            clave=input("Clave: ")
            login_response= login(correo,clave)

            if login_response['status'] == 500:
                print("Intente denuevo mas tarde")
                return
            elif login_response['status'] != 200:
                print("Credenciales erroneas")
                return
            else:
                print("autenticacion exitosa")
        case "2":
            nombre = input("Nombre: ")
            correo = input("Correo: ")
            clave = input("clave: ")
            desc = input("descripcion: ")
            reg_response= registrar(nombre,correo,clave,desc)

            if reg_response['status'] == 500:
                print("Intente denuevo mas tarde")
                return
            elif reg_response['status'] == 400:
                print("Los campos nombre, correo y clave son obligatorios.")
                return
            elif reg_response['status'] == 409:
                print("El correo ya está registrado")
                return
            else:
                print ("Usuario registrado exitosamente")
                return
            
    info=obtener_info(correo)
    print("Bienvenido", info["usuario"]["nombre"])
    while(True):
        print("1. Enviar un correo")
        print("2. Ver información de una dirección de correo electrónico")
        print("3. Ver correos marcados como favoritos")
        print("4. Marcar correo como favorito")
        print("5. Terminar con la ejecucion del cliente")
        n=int(input("Opcion: "))
        match n:
            case 1:
                Destinatario=input("Destinatario: ")
                Asunto=input("Asunto: ")
                Cuerpo=input("Cuerpo: ")
                ##Falta endpoint para mandar los correos
            case 2:
                correoinfo=input("Correo: ")
                infox=obtener_info(correoinfo)
                print("Nombre: ",infox["usuario"]["nombre"])
                print("Descripcion: ",infox["usuario"]["descripcion"])
            case 3:
                correosfav=obtener_correosfav(correo)
                if(correosfav['status']==200):
                    favoritos=correosfav['favoritos']
                    print("Correos favoritos: ")
                    for fav in favoritos:
                        correo=fav['correo']
                        correorem=(user_id(correo['idRemitente']))['correo']
                        print(f"Remitente: {correorem}")
                        print(f"Fecha: {correo['fecha']}")
                        print(f"Asunto: {correo['asunto']}")
                        print(f"Cuerpo: {correo['contenido']}")
                        print("------------------------------")
                else:
                    print("Error al obtener los correos favoritos")
            case 4:
                k=int(input("Numero de correo: "))
                res=marcar_favorito(correo,clave,k)
                if(res['status']==201):
                    print("Correo marcado exitosamente")
                elif(res['status']==404):
                    print("Correo no encontrado")
                elif(res['status']==403):
                    print("No eres el destinatario de este correo")
                else:
                    print("intente denuevo mas tarde")
            case 5:
                break
            
main()