import { Component, OnInit } from '@angular/core';
import { GLOBAL } from '../../services/global.service';
import { Router } from '@angular/router';
import { UploadService } from '../../services/upload.service';
import { UserService } from '../../services/user.service';
import { PartidoService } from 'src/app/services/partido.service';
import { Presidente } from '../../models/presidente.model';
import { PresidenteService } from '../../services/presidente.service';
import { PromesaPresidente } from '../../models/promesaPresidente.model';
import { PromesasPresidenteService } from '../../services/promesas-presidente.service';

@Component({
  selector: 'app-presidente',
  templateUrl: './presidente.component.html',
  styleUrls: ['./presidente.component.scss'],
  providers: [UploadService, UserService, PresidenteService, PartidoService, PromesasPresidenteService]
})
export class PresidenteComponent implements OnInit {
  public identity;
  public token;
  public url;
  public status: string;

  public filesToUpload: Array<File>;
  public presidentes: Presidente[];
  public presidente: Presidente;
  public modelPresidente: Presidente;
  public promesas: PromesaPresidente[] = null;
  public modelPromesa: PromesaPresidente;
  public posibilidadVotoPromesas: Boolean[] = [];
  public partido;
  constructor(
    private _router: Router,
    private _uploadService: UploadService,
    private _userService: UserService,
    private _presidenteService: PresidenteService,
    private _partidoService: PartidoService,
    private _promesaService: PromesasPresidenteService
  ) {
    this.identity = this._userService.getidentity();
    this.token = this._userService.getToken();
    this.partido = this._partidoService.getPartidoOnSessionStorage();
    this.url = GLOBAL.url;
  }

  ngOnInit() {
    this.listarPresidente();
    this.limpiarVariables();
  }

  public limpiarVariables() {
    this.modelPresidente = new Presidente('', '', this.partido._id, '');
    this.modelPromesa = new PromesaPresidente('', '', '', [], 0, 0);
    // this.presidente = new Presidente('', '', '', '');
  }

  public setPresidente(presidente: Presidente) {
    sessionStorage.setItem('partido', JSON.stringify(presidente));
    this.modelPresidente = presidente;
  }

  public setPromesa(promesa: PromesaPresidente) {
    this.modelPromesa = promesa;
  }

  public listarPresidente() {
    this._presidenteService.getPresidente(this.token, this.partido).subscribe(
      response => {
        if (response.presidente) {
          this.presidentes = response.presidente;
          this.presidente = this.presidentes[0];
          this.status = 'ok';
          if (this.presidentes.length > 0) {
            this.listarPromesas();
          }
        }
      }, error => {
        let errorMessage = <any>error;
        console.log(errorMessage);
        if (errorMessage != null)
        this.status = 'error';
      }
      );
    }

  public listarPromesas() {
    this._promesaService.getPromesas(this.token, this.presidente).subscribe(
      response => {
        if (response.promesas) {
          this.promesas = response.promesas;
          this.status = 'ok';
          this.posibilidadDeVoto();
        }
      }, error => {
        let errorMessage = <any>error;
        console.log(errorMessage);
        if (errorMessage != null)
          this.status = 'error';
      }
    );
  }

  public agregar() {
    this._presidenteService.addPresidente(this.modelPresidente, this.token).subscribe(
      response => {
        if (response.presidente) {
          this.listarPresidente();
          this.limpiarVariables();
          this.status = 'ok';
        }
      }, error => {
        let errorMessage = <any>error;
        console.log(errorMessage);
        if (errorMessage != null)
          this.status = 'error';
      }
    );
  }

  public editar() {
    this._presidenteService.updatePresidente(this.modelPresidente, this.token).subscribe(
      response => {
        if (response.presidente) {
          this.listarPresidente();
          this.status = 'ok';
          // subir imagen usuario
          if (this.filesToUpload) {
            this._uploadService.makeFileRequest(this.url + 'subir-imagen-presidente/' + this.modelPresidente._id, [], this.filesToUpload, this.token, 'image')
              .then((result: any) => {
                this.modelPresidente.image = result.presidente.image;
                this.listarPresidente();
                this.limpiarVariables();
              });
          }
        }
      }, error => {
        let errorMessage = <any>error;
        console.log(errorMessage);
        if (errorMessage != null)
          this.status = 'error';
      }
    );
  }

  public eliminar() {
    this._presidenteService.deletePresidente(this.modelPresidente._id, this.token).subscribe(
      response => {
        if (response.presidente) {
          this.listarPresidente();
          this.limpiarVariables();
          this.status = 'ok';
        }
      }, error => {
        let errorMessage = <any>error;
        console.log(errorMessage);
        if (errorMessage != null)
          this.status = 'error';
      }
    );
  }

  public agregarPromesa() {
    this.modelPromesa.candidato = this.presidente._id;
    this._promesaService.addPromesa(this.modelPromesa, this.token).subscribe(
      response => {
        if (response.promesa) {
          this.listarPromesas();
          this.limpiarVariables();
          this.status = 'ok';
        }
      }, error => {
        let errorMessage = <any>error;
        console.log(errorMessage);
        if (errorMessage != null)
          this.status = 'error';
      }
    );
  }

  public editarPromesa() {
    this._promesaService.updatePromesa(this.modelPromesa, this.token).subscribe(
      response => {
        if (response.promesa) {
          this.listarPromesas();
          this.limpiarVariables();
          this.status = 'ok';
        }
      }, error => {
        let errorMessage = <any>error;
        console.log(errorMessage);
        if (errorMessage != null)
          this.status = 'error';
      }
    );
  }

  public eliminarPromesa() {
    this._promesaService.deletePromesa(this.modelPromesa._id, this.token).subscribe(
      response => {
        if (response.promesa) {
          this.listarPromesas();
          this.limpiarVariables();
          this.status = 'ok';
        }
      }, error => {
        let errorMessage = <any>error;
        console.log(errorMessage);
        if (errorMessage != null)
          this.status = 'error';
      }
    );
  }

  posibilidadDeVoto() {
    this.posibilidadVotoPromesas = []
    for (let i = 0; i < this.promesas.length; i++) {
      this.posibilidadVotoPromesas.push(true);
      const promesa = this.promesas[i];
      promesa.votantes.forEach(votante => {
        if (votante == this.identity._id) {
          this.posibilidadVotoPromesas[i] = false;
        } else {
          this.posibilidadVotoPromesas[i] = true;
        }
      });
      console.log(this.posibilidadVotoPromesas);
    }
  }

  public votarSi(promesa: PromesaPresidente) {
    this._promesaService.votarSi(promesa, this.token).subscribe(
      response => {
        if (response.promesa) {
          this.listarPromesas();
          this.posibilidadDeVoto();
        }
      }, error => {
        let errorMessage = <any>error;
        console.log(errorMessage);
        if (errorMessage != null)
          this.status = 'error';
      }
    );
  }

  public votarNo(promesa: PromesaPresidente) {
    this._promesaService.votarNo(promesa, this.token).subscribe(
      response => {
        if (response.promesa) {
          this.listarPromesas();
          this.posibilidadDeVoto();
        }
      }, error => {
        let errorMessage = <any>error;
        console.log(errorMessage);
        if (errorMessage != null)
          this.status = 'error';
      }
    );
  }

  fileChangeEvent(fileInput: any) {
    this.filesToUpload = <Array<File>>fileInput.target.files;
  }
}
