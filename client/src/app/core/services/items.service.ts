import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { Item } from "../interfaces/item";

@Injectable({
    providedIn: 'root'
})
export class ItemsService {

    headers = new HttpHeaders({
        'Content-Type':"application/json"
    });

    private CATALOG = "/api/catalog/";
    private FIND_BY_KEYWORD = "/api/search/product";

    constructor(private http: HttpClient) {}

    findAll(catalogTitle: string) {
        let _url = this.CATALOG.concat(catalogTitle);
        return this.http.get<Array<Item>>(_url);
    }

    findByKeyword(keyword: string) {
        let body = { "keyword": keyword }
        let options = {
            headers: this.headers
        }
        return this.http.post(this.FIND_BY_KEYWORD, body, options);
    }

    findAllById(_url, ids) {
        let params = new HttpParams().set('ids',ids.join(","));
        let options = {
            params: params
        }
        return this.http.get<Array<Item>>(_url, options);
    }
}