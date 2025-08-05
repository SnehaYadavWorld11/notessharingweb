export function formDate(date){
    let formatedDate = new Date(date).toLocaleDateString();
    return formatedDate;
}