import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'jsonParse'
})
export class JsonParsePipe implements PipeTransform {
    transform(value: string | null | undefined): any[] {
        if (!value) {
          return [];
        }
    
        try {
          return JSON.parse(value);
        } catch {
          return [];
        }
      }
}
