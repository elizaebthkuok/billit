import { Injectable, OnInit } from "@angular/core";
import { AngularFirestore } from "angularfire2/firestore";

import { Bill, Account } from "./bill.model"
import { Subject } from "rxjs";
import { Subscription } from "rxjs/Subscription";
import { AuthService } from "../auth/auth.service";
import { User } from "../auth/user.model";

@Injectable()
export class BillsService {

    constructor(
        private db: AngularFirestore,
        private authService: AuthService
    ) { }

    billsChanged = new Subject<Bill[]>();
    accountsChanged = new Subject<Account[]>();
    private authSub: Subscription;
    private user: User;
    private bills: Bill[] = [];
    private accounts: Account[] = [];
    private fbSubs: Subscription[] = [];

    init() {
        this.authSub = this.authService.authChange.subscribe((user: User) => {
            console.log("User from auth service");
            console.log(user);
            if (user) {
                this.user = user;
                this.activateSubs();
            } else {
                this.cancelSubs();
                this.user = null;
            }
        });
    }

    fetchBills() {
        if (!this.user) return;
        const sub = this.db
            .collection(this.genUserPath('bills'))
            .snapshotChanges()
            .map(docArray => {
                return docArray.map(doc => {
                    return {
                        id: doc.payload.doc.id,
                        ...doc.payload.doc.data()
                    } as Bill;
                })
            })
            .subscribe((bills: Bill[]) => {
                this.bills = bills;
                this.billsChanged.next([...this.bills]);
            }, error => {
                // nothing yet
            });
        this.fbSubs.push(sub);
    }

    fetchAccounts() {
        if (!this.user) return;
        const sub = this.db
            .collection(this.genUserPath('accounts'))
            .snapshotChanges()
            .map(docArray => {
                return docArray.map(doc => {
                    console.log("Fetching accounts");
                    console.log(doc.payload.doc.data());
                    const account_id = doc.payload.doc.id
                    const acct = doc.payload.doc.data() as Account;
                    acct.bills = acct.bills.map(b => {
                        b.account_id = account_id;
                        return b;
                    });
                    return {
                        id: account_id,
                        ...acct
                    } as Account;
                })
            })
            .subscribe((accts: Account[]) => {
                this.accounts = accts;
                this.accountsChanged.next([...this.accounts]);
            }, error => {
                // nothing yet
            });
        
        this.fbSubs.push(sub);
    }

    updateAccountBill(bill: Bill) {
        const account = this.accounts
            .find((acct) => acct.id === bill.account_id);
        const index = account.bills.findIndex(b => b.id === bill.id);
        account.name = bill.name;
        account.notes = bill.notes;
        account.bills[index] = bill;
        console.log("Update service");
        console.log(account);
        this.db.doc(this.genUserPath('accounts') + '/' + account.id)
            .update(account);
    }

    updateBill(bill: Bill) {
        this.db.doc(this.genUserPath('bills') + '/' + bill.id)
            .update(bill);
    }

    deleteBill(bill: Bill) {
        this.db.doc(this.genUserPath('bills') + '/' + bill.id)
            .delete()
    }

    deleteAccount(bill: Bill) {
        this.db.doc(this.genUserPath('accounts') + '/' + bill.account_id)
            .delete()
    }

    getAccountBill(account_id: string, bill_id: string): Bill {
        const account = this.accounts
            .find((acct) => acct.id === account_id);
        if (account) {
            return account.bills.find((bill) => bill.id === bill_id);
        }
        return null;
    }

    getBill(bill_id: string) {
        return this.bills.find(b => b.id === bill_id);
    }

    createBill(bill: Bill) {
        this.db.collection(this.genUserPath('bills'))
            .add(bill);
    }

    createAccount(acct: Account) {
        acct.bills[0].id = this.db.createId();
        this.db.collection(this.genUserPath('accounts'))
            .add(acct);
    }

    cancelSubs() {
        this.fbSubs.forEach(sub => sub.unsubscribe());
    }

    private activateSubs() {
        this.fetchBills();
        this.fetchAccounts();
    }

    private genUserPath(collection_name: string) {
        return collection_name + '/' + this.user.userId + '/' + collection_name;
    }

    // testNestedDocuments() {
    //     const doc = this.db.doc('/parent/inDYLGtpuWKQAqCQqDPr');
    //     doc.collection('rent')
    //         .valueChanges()
    //         .subscribe(shit => {
    //             console.log(shit);
    //         });
    // }

    // testCreateNestedCollection() {
    //     let item = {
    //         id: this.db.createId()
    //     };
    //     let subitem = {
    //         id: this.db.createId(),
    //         name: 'nesttest'
    //     };
    //     this.db.collection('parent')
    //         .add(item)
    //         .then(doc => {
    //             doc.collection('test').add(subitem);
    //         });
    // }
}