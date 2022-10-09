
class ProductsMock {
    productsMock: any[] = [
        {
            id: "1",
            brand: "Apple",
            cost: 400,
            name: "iPhone",
            model: "11"
        },
        {
            id: "2",
            brand: "Apple",
            cost: 500,
            name: "iPhone",
            model: "12"
        },
        {
            id: "3",
            brand: "Apple",
            cost: 600,
            name: "iPhone",
            model: "13"
        },
        {
            id: "4",
            brand: "Apple",
            cost: 700,
            name: "iPhone",
            model: "14"
        },
    ]

    async find(): Promise<any[]> {
        return this.productsMock;
    }

    async findById(id: string): Promise<any> {
        return this.productsMock.find((product) => product.id === id);
    }
}

export const productsMock = new ProductsMock();