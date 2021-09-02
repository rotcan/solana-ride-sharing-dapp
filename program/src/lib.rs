use borsh::{BorshSerialize,BorshDeserialize};
use crate::{
    structs::{CustomerData,DriverData,RecordInstruction,SingleInstruction}
};
 
use{
    solana_program::{
        log::sol_log_compute_units,
        account_info::{next_account_info,AccountInfo},
        entrypoint,
        entrypoint::ProgramResult,
        msg,
        program_error::ProgramError,
        pubkey::Pubkey,
    }
};

pub mod helper;
pub mod processor;
pub mod structs;

use std::io::ErrorKind::InvalidData;


// const DUMMY_TX_ID: &str = "0000000000000000000000000000000000000000000";
// const DUMMY_CREATED_ON: &str = "0000000000000000";
// const DUMMY_LATLONG: &str="00000000";
const DUMMY_COST: &str="000000000000";
const DUMMY_ADDRESS: &str = "00000000000000000000000000000000000000000000";
// const DUMMY_DISTANCE : &str="0000";
const KM_RATE: f32=0.01 ; //Sol
// const DUMMY_INSTRUCTION: &str = "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";



// #[derive(BorshSerialize,BorshDeserialize,Debug)]
// pub struct ProfileData{
//     pub profile_hash: String,
//     pub rides_hash: String,
//     //pub rides: u8,
//     pub updated_on: String,
//     pub type: u8
// }
// const DUMMY_ADDRESS: &str= "00000000000000000000000000000000000000000000";
// const DUMMY_COST: &str= "00000000";


//Steps
//1 to create customer
//2 to create customer ride
//3 to create driver
//4 driver selects customers for ride -> customer account updates with driver and max cost
//5 customer select a driver -> driver account updates with customer confirmation -> if 2 confirm -> ride start & customer is notified
//6 driver ride per customer -> generate cost for customer

//not here but customer then transfers the money to driver

// #[derive(BorshSerialize,BorshDeserialize,Debug)]
// pub struct DriverData{
//     pub profile_hash: String,
//     pub updated_on: String
// }

// #[derive(BorshSerialize,BorshDeserialize,Debug)]
// pub struct AdminData{
//     pub kmRate: String
// }
 

 
//break instruction
//record_type = 1 0-1
//user_type  = 1 1-2
//profile_ hash  = 43 2-45 
//lats = 8*4 45-53,53-61,61-69,69-77
//dist = 4 77-81
//customer_count = 1  81-82
//updated_on = 16 82-98
//driver_address = 44 98-142
//customer address = 44 142-186
//total rides distance 186-190
//rides confirmed 190-194
// const DUMMY_HASH: &str="0000000000000000000000000000000000000000000";
// const DUMMY_TIME: &str="0000000000000000";

//ride states
// 0 not started , 1 as pending , 2 as started, 3 as end, 4 as paid 
entrypoint!(process_instruction);


pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    //solana_logger::setup_with("solana=debug");

    let account_iter=&mut accounts.iter();
    // let instruction = RecordInstruction::try_from_slice(instruction_data).map_err(|err|{
    //     msg!("Attempt to deserialize data failed {:?}",err);
    //     ProgramError::InvalidInstructionData
    // })?;

    let instruction = SingleInstruction::try_from_slice(instruction_data).map_err(|err|{
        msg!("Attempt to deserialize data failed {:?}",err);
        ProgramError::InvalidInstructionData
    })?;

    let full_instruction = instruction.full_instruction;
    let record_type= &full_instruction[0..1];
    let user_type= &full_instruction[1..2];
    msg!("instruction type { }",record_type);
    match &record_type[..]{
        //init customer/driver
        "0" =>  {
            if user_type==String::from("1")
            {
                let account=next_account_info(account_iter)?;
                crate::processor::step0_1(account,program_id);
            }
            if user_type==String::from("2")
            {
                let account=next_account_info(account_iter)?;
                crate::processor::step0_2(account,program_id);
            }
        }
        //create customer
        "1" =>  {
            let account=next_account_info(account_iter)?;
            crate::processor::step1(account,program_id,full_instruction);

        }
        //save new customer ride
        "2" => {
            let account=next_account_info(account_iter)?;
            crate::processor::step2(account,program_id,full_instruction);
        }
        //save driver data
        "3" =>  {
            let account=next_account_info(account_iter)?;
            crate::processor::step3(account,program_id,full_instruction);
            
        },
        //driver select customer for rides
        //first is driver account
        //then the customer 
        
        "4" =>  {
            //let customer_ride_count = instruction.customer_count;
            //let dist_f = instruction.distance.parse::<f32>().unwrap();
            
            // let driver_base58=String::from(DUMMY_ADDRESS);
            // let customer_base58=String::from(DUMMY_ADDRESS);
            
            // //driver
            let driver_account=next_account_info(account_iter)?;
            
            let customer_account_1=next_account_info(account_iter)?;
            
            crate::processor::step4(driver_account,customer_account_1,program_id,full_instruction);
             
            
        }

        "5"=>{
            let customer_account_1=next_account_info(account_iter)?;
            
            let driver_account=next_account_info(account_iter)?;
            
            crate::processor::step5(customer_account_1,driver_account,program_id,full_instruction);
             
            
        }

        "6"=>{
            let driver_account=next_account_info(account_iter)?;
            
            let customer_account=next_account_info(account_iter)?;
            // let customer_account_2=next_account_info(account_iter)?;
            // let customer_account_3=next_account_info(account_iter)?;
            
            
            crate::processor::step6_2(driver_account,customer_account,program_id,full_instruction);
             
            
        }

        "7"=>{
            let driver_account=next_account_info(account_iter)?;
            
            // let customer_account_2=next_account_info(account_iter)?;
            // let customer_account_3=next_account_info(account_iter)?;
            
            
            crate::processor::step7(driver_account,program_id,full_instruction);
             
            
        }

        "8"=>{
            
            let driver_account=next_account_info(account_iter)?;
            
            let customer_account=next_account_info(account_iter)?;
            
            crate::processor::step8(driver_account,customer_account,program_id,full_instruction);
             
            
        }

        "9"=>{
            
            let customer_account=next_account_info(account_iter)?;
            
            let driver_account=next_account_info(account_iter)?;
            
            crate::processor::step9(customer_account,driver_account,program_id,full_instruction);
             
            
        }

        _ => {
            msg!("Instruction did not match");
        }
    }
    // let account=next_account_info(account_iter)?;

    // if account.owner!=program_id{
    //     msg!("This account {} is not owned by program {}",account.key,program_id);
    // }

    
    // //check if format of data is correct
    // let instruction_data_profile=ProfileData::try_from_slice(instruction_data).map_err(|err|{
    //     msg!("Attempt to deserialized data failed {:?}",err);
    //     ProgramError::InvalidInstructionData
    // })?;

    // let mut existing_profile_data=ProfileData::try_from_slice(&account.data.borrow_mut()){
    //     Ok(data)=>data,
    //     Err(err)=>{
    //         panic!("Unknown error {:?}",err);
    //     }
    // };
    
    //get data pointer from account
    // let data=&mut &mut account.data.borrow_mut();
    //save instruction data to account data
    // data[..instruction_data.len()].copy_from_slice(&instruction_data);

    sol_log_compute_units();

    // msg!("Data updated at time {}",instruction.record_type);

    Ok(())

}



// Sanity tests
#[cfg(test)]
mod test {
    use super::*;
    use solana_program::clock::Epoch;
    //use std::mem;

    #[test]
    fn test_1() {
        let program_id = Pubkey::default();
        let key = Pubkey::default();
        let mut lamports = 0;
        let customer_init_account = get_init_acccount(); 
        let mut data =customer_init_account.try_to_vec().unwrap();
        let owner = Pubkey::default();
        let account = AccountInfo::new(
            &key,
            false,
            true,
            &mut lamports,
            &mut data,
            &owner,
            false,
            Epoch::default(),
        );
        
        let customer_init_driver = get_init_driver(); 
        let mut data_2  =customer_init_driver.try_to_vec().unwrap();
        let mut lamports_2 = 0;
        let account_3 = AccountInfo::new(
            &key,
            false,
            true,
            &mut lamports_2,
            &mut data_2,
            &owner,
            false,
            Epoch::default(),
        );


        let archive_id = "abcdefghijabcdefghijabcdefghijabcdefghijabc";
        let mut instruction_data_1 = get_empty_instruction();
        instruction_data_1.record_type=String::from("1");
        instruction_data_1.profile_hash=String::from(archive_id);
        
        let instruct_data_u8=instruction_data_1.try_to_vec().unwrap();

        let accounts = vec![account];
        let mut account_data = CustomerData::try_from_slice(&accounts[0].data.borrow()).unwrap();

        msg!("customer hash {:?}", account_data.profile_hash);
        
        process_instruction(&program_id, &accounts, &instruct_data_u8).unwrap();
        account_data = CustomerData::try_from_slice(&accounts[0].data.borrow()).unwrap();

        let test_archive_id = account_data.profile_hash;
        //let test_created_on = &chat_messages.created_on;
        msg!("customer hash {:?}", test_archive_id);
        // I added first data and expect it to contain the given data
        assert_eq!(
            String::from(archive_id).eq(&test_archive_id),
            true
        );


        //test2
        let mut instruction_data_2= get_empty_instruction();
        instruction_data_2.record_type=String::from("2");
        instruction_data_2.from_lat=String::from("00000001");
        instruction_data_2.to_lat=String::from("00000002");
        instruction_data_2.from_long=String::from("00000003");
        instruction_data_2.to_long=String::from("00000004");
        instruction_data_2.dist= String::from("5.40");

        let instruct_data_u8_2=instruction_data_2.try_to_vec().unwrap();

        //let accounts = vec![account];
        //msg!("customer hash {:?}", account_data.from_lat);
        
        process_instruction(&program_id, &accounts, &instruct_data_u8_2).unwrap();
        account_data = CustomerData::try_from_slice(&accounts[0].data.borrow()).unwrap();

        let test_from_lat = account_data.from_lat;
        //let test_created_on = &chat_messages.created_on;
        msg!("customer hash {:?}", test_archive_id);
        // I added first data and expect it to contain the given data
        assert_eq!(
            String::from("00000001").eq(&test_from_lat),
            true
        );

        //test3
        
        let archive_id_2 = "abcdefghijabcdefghijabcdefghijabcdefg111111";
        let mut instruction_data_3 = get_empty_instruction();
        instruction_data_3.record_type=String::from("3");
        instruction_data_3.profile_hash=String::from(archive_id_2);
        
        let instruct_data_u8_3=instruction_data_3.try_to_vec().unwrap();

        let accounts_3 = vec![account_3];
        let mut account_data_3 = DriverData::try_from_slice(&accounts_3[0].data.borrow()).unwrap();

        msg!("driver hash {:?}", account_data_3.profile_hash);
        
        process_instruction(&program_id, &accounts_3, &instruct_data_u8_3).unwrap();
        account_data_3 = DriverData::try_from_slice(&accounts_3[0].data.borrow()).unwrap();

        let test_archive_id_3 = account_data_3.profile_hash;
        //let test_created_on = &chat_messages.created_on;
        msg!("driver hash {:?}", test_archive_id_3);
        // I added first data and expect it to contain the given data
        assert_eq!(
            String::from(archive_id_2).eq(&test_archive_id_3),
            true
        );


        //test4
        // let mut instruction_data_4 = get_empty_instruction();
        // instruction_data_4.record_type=String::from("4");
        // instruction_data_4.dist=String::from("0010");
        // instruction_data_4.driver_address=String::from("00000000000000000000000000000000000000000001");
        // instruction_data_4.customer_address=String::from("00000000000000000000000000000000000000000002");

        // let instruct_data_u8_4=instruction_data_4.try_to_vec().unwrap();
        
        // //let accounts_4 = vec![account, account_3];
        
        // process_instruction(&program_id, &accounts, &instruct_data_u8_4).unwrap();
        // let mut account_data_c_4 = CustomerData::try_from_slice(&accounts[0].data.borrow()).unwrap();
        // let mut account_data_d_4 = DriverData::try_from_slice(&accounts[1].data.borrow()).unwrap();

        // let customer_driver_address_4 = account_data_c_4.driver_address_1;
        // let driver_customer_address_4 = account_data_d_4.customer_1;

        // assert_eq!(
        //     String::from("00000000000000000000000000000000000000000001").eq(&customer_driver_address_4),
        //     true
        // );

        // assert_eq!(
        //     String::from("00000000000000000000000000000000000000000002").eq(&driver_customer_address_4),
        //     true
        // );

        
        // assert_eq!(
        //     String::from(created_on).eq(test_created_on),
        //     true
        // );
    }

    
}
