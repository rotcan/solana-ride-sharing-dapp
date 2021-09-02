use crate::{
    structs::{CustomerData,DriverData}
};
use solana_program::{
    account_info::{next_account_info,AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};
use borsh::{BorshSerialize,BorshDeserialize};
use std::io::ErrorKind::InvalidData;
use crate::helper;

//init customer
pub fn step0_1(account: &AccountInfo,program_id: &Pubkey) -> ProgramResult{
    if account.owner!=program_id{
        msg!("This account {} is not owned by program {}",account.key,program_id);
    }
     
    //get customer account
    let mut customer_account = match CustomerData::try_from_slice(&account.data.borrow_mut()) {
        Ok(data) => data,
        Err(err) => {
            if err.kind() == InvalidData {
                msg!("InvalidData so initializing account data");
                crate::helper::get_init_acccount()
            } else {
                panic!("Unknown error decoding account data {:?}", err)
            }
        }
    };
    //update hash
    //customer_account.profile_hash=instruction.profile_hash;
    customer_account=crate::helper::get_init_acccount();
    //save account
    customer_account.serialize(&mut &mut account.data.borrow_mut()[..]).map_err(|e| e.into())
    
    // msg!("customer_account data after saving {:?}",customer_account);
}

//init driver
pub fn step0_2(account: &AccountInfo,program_id: &Pubkey) -> ProgramResult{
    if account.owner!=program_id{
        msg!("This account {} is not owned by program {}",account.key,program_id);
    }
     
    //get customer account
    let mut customer_account = match DriverData::try_from_slice(&account.data.borrow_mut()) {
        Ok(data) => data,
        Err(err) => {
            if err.kind() == InvalidData {
                msg!("InvalidData so initializing account data");
                crate::helper::get_init_driver()
            } else {
                panic!("Unknown error decoding account data {:?}", err)
            }
        }
    };
    //update hash
    //customer_account.profile_hash=instruction.profile_hash;
    customer_account=crate::helper::get_init_driver();
    //save account
    customer_account.serialize(&mut &mut account.data.borrow_mut()[..]).map_err(|e| e.into())
    
    // msg!("customer_account data after saving {:?}",customer_account);
}

pub fn step1(account: &AccountInfo,program_id: &Pubkey, full_instruction: String) -> ProgramResult{
    if account.owner!=program_id{
        msg!("This account {} is not owned by program {}",account.key,program_id);
    }
    let instr_profile_hash= &full_instruction[2..45];
    //msg!("Instruction to update profile hash {}",instruction.profile_hash);
    msg!("Instruction to update profile hash {}",instr_profile_hash);
    //get customer account
    let mut customer_account = match CustomerData::try_from_slice(&account.data.borrow_mut()) {
        Ok(data) => data,
        Err(err) => {
            if err.kind() == InvalidData {
                msg!("InvalidData so initializing account data");
                crate::helper::get_init_acccount()
            } else {
                panic!("Unknown error decoding account data {:?}", err)
            }
        }
    };
    //update hash
    //customer_account.profile_hash=instruction.profile_hash;
    customer_account.profile_hash=String::from(instr_profile_hash);
    //save account
    customer_account.serialize(&mut &mut account.data.borrow_mut()[..]).map_err(|e| e.into())
    
    // msg!("customer_account data after saving {:?}",customer_account);
}

pub fn step2(account: &AccountInfo,program_id: &Pubkey, full_instruction: String) -> ProgramResult{
    if account.owner!=program_id{
        msg!("This account {} is not owned by program {}",account.key,program_id);
    }
    //msg!("Instruction to update ride details {}",instruction.profile_hash);
     //get customer account
    let mut customer_account = match CustomerData::try_from_slice(&account.data.borrow_mut()) {
        Ok(data) => data,
        Err(err) => {
            if err.kind() == InvalidData {
                msg!("InvalidData so initializing account data");
                crate::helper::get_init_acccount()
            } else {
                panic!("Unknown error decoding account data {:?}", err)
            }
        }
    };
    msg!("customer_account data decoded");
    //update ride
    let from_lat= &full_instruction[45..53];
    let to_lat= &full_instruction[53..61];
    let from_long= &full_instruction[61..69];
    let to_long= &full_instruction[69..77];
    let dist=  &full_instruction[77..81];
    customer_account.from_lat=String::from(from_lat);
    customer_account.to_lat=String::from(to_lat);
    customer_account.from_long=String::from(from_long);
    customer_account.to_long=String::from(to_long);
    customer_account.distance=String::from(dist);

    // customer_account.from_lat=instruction.from_lat;
    // customer_account.to_lat=instruction.to_lat;
    // customer_account.from_long=instruction.from_long;
    // customer_account.to_long=instruction.to_long;
    // customer_account.distance = instruction.dist;

    
    //save account
    customer_account.serialize(&mut &mut account.data.borrow_mut()[..]).map_err(|e| e.into())
    //msg!("customer_account data after saving {:?}",customer_account)
}

pub fn step3(account: &AccountInfo,program_id: &Pubkey, full_instruction: String) -> ProgramResult{
    if account.owner!=program_id{
        msg!("This account {} is not owned by program {}",account.key,program_id);
    }
    //msg!("Instruction to update driver account hash {}",instruction.profile_hash);
    //get customer account
    let mut driver_account = match DriverData::try_from_slice(&account.data.borrow_mut()) {
        Ok(data) => data,
        Err(err) => {
            if err.kind() == InvalidData {
                msg!("InvalidData so initializing account data");
                crate::helper::get_init_driver()
            } else {
                panic!("Unknown error decoding account data {:?}", err)
            }
        }
    };
    let instr_profile_hash= &full_instruction[2..45];
    //update hash
    driver_account.profile_hash=String::from(instr_profile_hash);
    msg!("driver_Account data before saving {:?}",driver_account);
    //save driver_account
    driver_account.serialize(&mut &mut account.data.borrow_mut()[..]).map_err(|e| e.into())
    //msg!("customer_account data after saving {:?}",customer_account);
}
 
pub fn step4(driver_account: &AccountInfo,customer_account_1: &AccountInfo,program_id: &Pubkey, full_instruction: String) -> ProgramResult{

    let dist_str=&full_instruction[77..81];
    //driver covered distance
    let dist_f = String::from(dist_str).parse::<f32>().unwrap();

    let rides_dist_str=&full_instruction[186..190];
    //total rides distance
    let rides_dist_f = String::from(rides_dist_str).parse::<f32>().unwrap();
    
    //max for both
    let dist_str_max=&full_instruction[190..194];
    let rides_max_dist_str=&full_instruction[194..198];
    let dist_f_max = String::from(dist_str_max).parse::<f32>().unwrap();
    let rides_dist_max_f = String::from(rides_max_dist_str).parse::<f32>().unwrap();
    //let dist_f=0.0; Driver cost
    let total_cost=dist_f*helper::KM_RATE;
    let total_cost_max=dist_f_max*helper::KM_RATE;

    let driver_base58=String::from(&full_instruction[98..142]);
    let customer_base58=String::from(&full_instruction[142..186]);
    
    if driver_account.owner!=program_id{
        msg!("This account {} is not owned by program {}",driver_account.key,program_id);
    }
    //let driver_account_key:String =String::from(driver_account.key);
    msg!("driver_account.key {}",driver_base58);
    let mut driver_account_data =  DriverData::try_from_slice(&driver_account.data.borrow_mut()).map_err(|err|{
        msg!("Attempt to deserialize data failed {:?}",err);
        ProgramError::InvalidInstructionData
    })?;
    
    //customer 1
    if customer_account_1.owner!=program_id{
        msg!("This account {} is not owned by program {}",customer_account_1.key,program_id);
    }
    
    let mut customer_account_1_data =  CustomerData::try_from_slice(&customer_account_1.data.borrow_mut()).map_err(|err|{
        msg!("Attempt to deserialize data failed {:?}",err);
        ProgramError::InvalidInstructionData
    })?;

    // //let customer_account_1_key=String::from(customer_account_1.key);
    // //let customer_distance: String = customer_account_1_data.distance;
    let cust_dist_f=customer_account_1_data.distance.parse::<f32>().unwrap();
    //total ride cost for driver dist_f*kmrate = total_cost
    //customers kms covered rides_dist_f
    //customer cost = customer  * total cost/ total rides distance  

    let c1_cost=cust_dist_f*total_cost/rides_dist_f;
    let c_cost_max=cust_dist_f*total_cost_max/rides_dist_max_f;

    let padded_cost=helper::pad_cost(c1_cost,helper::DUMMY_COST);
    let mut customer_mapped: bool = false;
    if customer_account_1_data.driver_address_1==String::from(helper::DUMMY_ADDRESS)
    {
        customer_account_1_data.driver_address_1=driver_base58;
        customer_account_1_data.cost_1=padded_cost;
        customer_account_1_data.cost_1_max=helper::pad_cost(c_cost_max,helper::DUMMY_COST);
        customer_mapped=true;
    }else if customer_account_1_data.driver_address_2==String::from(helper::DUMMY_ADDRESS)
    {
        customer_account_1_data.driver_address_2=driver_base58;
        customer_account_1_data.cost_2=padded_cost;
        customer_account_1_data.cost_2_max=helper::pad_cost(c_cost_max,helper::DUMMY_COST);
        customer_mapped=true;
    }else if customer_account_1_data.driver_address_3==String::from(helper::DUMMY_ADDRESS){
        customer_account_1_data.driver_address_3=driver_base58;
        customer_account_1_data.cost_3=padded_cost;
        customer_account_1_data.cost_3_max=helper::pad_cost(c_cost_max,helper::DUMMY_COST);
        customer_mapped=true;
    }else  if customer_account_1_data.driver_address_4==String::from(helper::DUMMY_ADDRESS) {
        customer_account_1_data.driver_address_4=driver_base58;
        customer_account_1_data.cost_4=padded_cost;
        customer_account_1_data.cost_4_max=helper::pad_cost(c_cost_max,helper::DUMMY_COST);
        customer_mapped=true;
    }

    
    if customer_mapped==true{
        if driver_account_data.customer_1== String::from(helper::DUMMY_ADDRESS){
            driver_account_data.customer_1=customer_base58;
        }else if driver_account_data.customer_2== String::from(helper::DUMMY_ADDRESS){
            driver_account_data.customer_2=customer_base58;
        }else if driver_account_data.customer_3== String::from(helper::DUMMY_ADDRESS){
            driver_account_data.customer_3=customer_base58;
        }
        driver_account_data.ride_state=String::from("1"); //pending
    }

    msg!("driver_Account data before saving {:?}",driver_account);
    //save driver_account
    driver_account_data.serialize(&mut &mut driver_account.data.borrow_mut()[..])?;
    customer_account_1_data.serialize(&mut &mut customer_account_1.data.borrow_mut()[..]).map_err(|e2| e2.into())
}


//step5 customer selects ride  
pub fn step5(customer_account: &AccountInfo,driver_account: &AccountInfo,program_id: &Pubkey, full_instruction: String) -> ProgramResult{

    let startSize1:usize=98;
    let mut endSize1:usize=142;
    
    if String::from(&full_instruction[141..142])==String::from("0"){
        endSize1=141;
    }

    
    // if String::from(&full_instruction[141..142])==String::from("0"){
    //     driver_base58=String::from(&full_instruction[98..141]);
    // }
    let driver_base58=String::from(&full_instruction[startSize1..endSize1]);

    let startSize2:usize=142;
    let mut endSize2:usize=186;
    
    
    if String::from(&full_instruction[185..186])==String::from("0"){
        endSize2=185;
    }
    let customer_base58=String::from(&full_instruction[startSize2..endSize2]);
    
    //customer 1
    if customer_account.owner!=program_id{
        msg!("This account {} is not owned by program {}",customer_account.key,program_id);
    }
    
    let mut customer_account_data =  CustomerData::try_from_slice(&customer_account.data.borrow_mut()).map_err(|err|{
        msg!("Attempt to deserialize data failed {:?}",err);
        ProgramError::InvalidInstructionData
    })?;


    if driver_account.owner!=program_id{
        msg!("This account {} is not owned by program {}",driver_account.key,program_id);
    }
    //let driver_account_key:String =String::from(driver_account.key);
    msg!("driver_account.key {}",driver_base58);
    let mut driver_account_data =  DriverData::try_from_slice(&driver_account.data.borrow_mut()).map_err(|err|{
        msg!("Attempt to deserialize data failed {:?}",err);
        ProgramError::InvalidInstructionData
    })?;
    

    //update customer selection
    if customer_account_data.driver_address_1==driver_base58
    {
        customer_account_data.driver_select=String::from("1")
    }else if customer_account_data.driver_address_2==driver_base58
    {
        customer_account_data.driver_select=String::from("2")
        
    }else if customer_account_data.driver_address_3==driver_base58
    {
        customer_account_data.driver_select=String::from("3")
    }else  if customer_account_data.driver_address_4==driver_base58 
    {
        customer_account_data.driver_select=String::from("4")
    }

    //confirm to driver
    if driver_account_data.customer_1== customer_base58{
        driver_account_data.customer_1_confirm=String::from("1");  
    }else if driver_account_data.customer_2== customer_base58{
        driver_account_data.customer_2_confirm=String::from("1");
    }else if driver_account_data.customer_3== customer_base58{
        driver_account_data.customer_3_confirm=String::from("1");
    }
    

    msg!("driver_Account data before saving {:?}",driver_account);
    //save driver_account
    driver_account_data.serialize(&mut &mut driver_account.data.borrow_mut()[..])?;
    customer_account_data.serialize(&mut &mut customer_account.data.borrow_mut()[..]).map_err(|e2| e2.into())
}


//step6 on confirmation from 2 starts ride, clears one from the one not confirmed
// pub fn step6(driver_account: &AccountInfo,customer_account_1: &AccountInfo, customer_account_2: &AccountInfo,
//     customer_account_3: &AccountInfo,
//     program_id: &Pubkey, full_instruction: String) -> ProgramResult{
     
//     let driver_confirm=String::from(&full_instruction[190..194]);

//     let dist_str=&full_instruction[77..81];
//     //driver covered distance
//     let dist_f = String::from(dist_str).parse::<f32>().unwrap();

//     let rides_dist_str=&full_instruction[186..190];
//     //total rides distance
//     let rides_dist_f = String::from(rides_dist_str).parse::<f32>().unwrap();

//     //let dist_f=0.0; Driver cost
//     let total_cost=dist_f*helper::KM_RATE;

//     //let mut driver_base58=String::from(&full_instruction[198..242]);
//     //if String::from(&full_instruction[141..142])==String::from("0"){
//     //    driver_base58=String::from(&full_instruction[198..241]);
//     //}
//     let startSize1:usize=198;
//     let mut endSize1:usize=242;
    
//     if String::from(&full_instruction[241..242])==String::from("0"){
//         endSize1=241;
//     }

//     //let driver_base58=String::from(&full_instruction[startSize1..endSize1]);
    
//     //driver
//     if driver_account.owner!=program_id{
//         msg!("This account {} is not owned by program {}",driver_account.key,program_id);
//     }
//     //let driver_account_key:String =String::from(driver_account.key);
//     msg!("driver_confirm  {}",driver_confirm);
//     let mut driver_account_data =  DriverData::try_from_slice(&driver_account.data.borrow_mut()).map_err(|err|{
//         msg!("Attempt to deserialize data failed {:?}",err);
//         ProgramError::InvalidInstructionData
//     })?;
    
//     //customer 1
//     if customer_account_1.owner!=program_id{
//         msg!("This account {} is not owned by program {}",customer_account_1.key,program_id);
//     }
    
//     let mut customer_account_data_1 =  CustomerData::try_from_slice(&customer_account_1.data.borrow_mut()).map_err(|err|{
//         msg!("Attempt to deserialize data failed {:?}",err);
//         ProgramError::InvalidInstructionData
//     })?;

//     //customer 2
//     if customer_account_2.owner!=program_id{
//         msg!("This account {} is not owned by program {}",customer_account_2.key,program_id);
//     }
    
//     let mut customer_account_data_2 =  CustomerData::try_from_slice(&customer_account_2.data.borrow_mut()).map_err(|err|{
//         msg!("Attempt to deserialize data failed {:?}",err);
//         ProgramError::InvalidInstructionData
//     })?;

//     //customer 3
//     if customer_account_3.owner!=program_id{
//         msg!("This account {} is not owned by program {}",customer_account_3.key,program_id);
//     }
    
//     let mut customer_account_data_3 =  CustomerData::try_from_slice(&customer_account_3.data.borrow_mut()).map_err(|err|{
//         msg!("Attempt to deserialize data failed {:?}",err);
//         ProgramError::InvalidInstructionData
//     })?;

    
//     if &driver_confirm[0..1]==String::from("1")
//     {
//         customer_account_data_1.driver_confirm=String::from("1");
//         customer_account_data_1.ride_state=String::from("2"); //start
//         customer_account_data_1.driver_pub_key=String::from(&full_instruction[startSize1..endSize1]);
//         customer_account_data_1.final_cost=customer_account_data_1.cost_1;
//     }else 
//     {
//         customer_account_data_1.driver_select=String::from("0");
//         customer_account_data_1.driver_confirm=String::from("0");
//         customer_account_data_1.ride_state=String::from("0");
//         driver_account_data.customer_1=String::from(helper::DUMMY_ADDRESS);
//         driver_account_data.customer_1_confirm=String::from("0");
//     }
    
//     if &driver_confirm[1..2]==String::from("1")
//     {
//         customer_account_data_2.driver_confirm=String::from("1");
//         customer_account_data_2.ride_state=String::from("2") ; //start
//         customer_account_data_2.driver_pub_key=String::from(&full_instruction[startSize1..endSize1]);
//     }else 
//     {
//         customer_account_data_2.driver_select=String::from("0");
//         customer_account_data_2.driver_confirm=String::from("0");
//         customer_account_data_2.ride_state=String::from("0");
//         driver_account_data.customer_2=String::from(helper::DUMMY_ADDRESS);
//         driver_account_data.customer_2_confirm=String::from("0");
//     }
    

//     if &driver_confirm[2..3]==String::from("1")
//     {
//         customer_account_data_3.driver_confirm=String::from("1");
//         customer_account_data_3.ride_state=String::from("2"); //start
//         customer_account_data_3.driver_pub_key=String::from(&full_instruction[startSize1..endSize1]);
        
//     }else 
//     {
//         customer_account_data_3.driver_select=String::from("0");
//         customer_account_data_3.driver_confirm=String::from("0");
//         customer_account_data_3.ride_state=String::from("0");
//         driver_account_data.customer_3=String::from(helper::DUMMY_ADDRESS);
//         driver_account_data.customer_3_confirm=String::from("0");
//     }

//     driver_account_data.customer_rides_to_finish=driver_confirm;
//     driver_account_data.ride_state=String::from("2"); //start
//     msg!("driver_Account data before saving {:?}",driver_account);
//     //save driver_account
//     driver_account_data.serialize(&mut &mut driver_account.data.borrow_mut()[..])?;
//     //save customer
//     customer_account_data_1.serialize(&mut &mut customer_account_1.data.borrow_mut()[..])?;
//     customer_account_data_2.serialize(&mut &mut customer_account_2.data.borrow_mut()[..])?;
//     customer_account_data_3.serialize(&mut &mut customer_account_3.data.borrow_mut()[..]).map_err(|e2| e2.into())
// }



pub fn step6_2(driver_account: &AccountInfo,customer_account: &AccountInfo,
    program_id: &Pubkey, full_instruction: String) -> ProgramResult{
     
    let driver_confirm=String::from(&full_instruction[190..191]);
    let driver_customer_id=String::from(&full_instruction[194..195]);
    let dist_str=&full_instruction[77..81];
   
    let start_size1:usize=98;
    let mut end_size1:usize=142;
    
    if String::from(&full_instruction[141..142])==String::from("0"){
        end_size1=141;
    }
    // let driver_base58=String::from(&full_instruction[start_size1..end_size1]);
    
    let start_size2:usize=198;
    let mut end_size2:usize=242;
    
    if String::from(&full_instruction[241..242])==String::from("0"){
        end_size2=241;
    }

    //driver covered distance
    let dist_f = String::from(dist_str).parse::<f32>().unwrap();
    let total_cost_f=dist_f*helper::KM_RATE;
    let rides_dist_str=&full_instruction[186..190];
    //total rides distance
    let rides_dist_f = String::from(rides_dist_str).parse::<f32>().unwrap();

    // let driver_pubkey58=String::from(&full_instruction[start_size2..end_size2]);
    //driver
    if driver_account.owner!=program_id{
        msg!("This account {} is not owned by program {}",driver_account.key,program_id);
    }
    //let driver_account_key:String =String::from(driver_account.key);
    msg!("driver_confirm  {}",driver_confirm);
    let mut driver_account_data =  DriverData::try_from_slice(&driver_account.data.borrow_mut()).map_err(|err|{
        msg!("Attempt to deserialize data failed {:?}",err);
        ProgramError::InvalidInstructionData
    })?;
    
    //customer 1
    if customer_account.owner!=program_id{
        msg!("This account {} is not owned by program {}",customer_account.key,program_id);
    }
    
    let mut customer_account_data =  CustomerData::try_from_slice(&customer_account.data.borrow_mut()).map_err(|err|{
        msg!("Attempt to deserialize data failed {:?}",err);
        ProgramError::InvalidInstructionData
    })?;

    driver_account_data.dist=String::from(dist_str);
    if driver_confirm==String::from("1")
    {
        let cust_dist_f=customer_account_data.distance.parse::<f32>().unwrap();
        
        let c1_cost=cust_dist_f*total_cost_f/rides_dist_f;
        //let padded_cost=helper::pad_cost(c1_cost,helper::DUMMY_COST);
        customer_account_data.final_cost=helper::pad_cost(c1_cost,helper::DUMMY_COST);
        customer_account_data.to_pay=helper::pad_cost(c1_cost,helper::DUMMY_COST);
        customer_account_data.driver_confirm=String::from("1");
        customer_account_data.ride_state=String::from("2"); //start
        customer_account_data.driver_pub_key=String::from(&full_instruction[start_size2..end_size2]);
    }else{
        customer_account_data.driver_select=String::from("0");
        customer_account_data.driver_confirm=String::from("0");
        customer_account_data.ride_state=String::from("0");
        
        if customer_account_data.driver_address_1==String::from(&full_instruction[start_size1..end_size1])
        {
            customer_account_data.driver_address_1=String::from(helper::DUMMY_ADDRESS);
            customer_account_data.cost_1=String::from(helper::DUMMY_COST);
            
        }else if customer_account_data.driver_address_2==String::from(&full_instruction[start_size1..end_size1])
        {
            customer_account_data.driver_address_2=String::from(helper::DUMMY_ADDRESS);
            customer_account_data.cost_2=String::from(helper::DUMMY_COST);
            
        }else if customer_account_data.driver_address_3==String::from(&full_instruction[start_size1..end_size1])
        {
            customer_account_data.driver_address_3=String::from(helper::DUMMY_ADDRESS);
            customer_account_data.cost_3=String::from(helper::DUMMY_COST);
            
        }else  if customer_account_data.driver_address_4==String::from(&full_instruction[start_size1..end_size1])
        {
            customer_account_data.driver_address_4=String::from(helper::DUMMY_ADDRESS);
            customer_account_data.cost_4=String::from(helper::DUMMY_COST);
            
        }

        if driver_customer_id==String::from("1")
        {
            driver_account_data.customer_1=String::from(helper::DUMMY_ADDRESS);
            driver_account_data.customer_1_confirm=String::from("0");
        }
        if driver_customer_id==String::from("2")
        {
            driver_account_data.customer_2=String::from(helper::DUMMY_ADDRESS);
            driver_account_data.customer_2_confirm=String::from("0");
        }
        if driver_customer_id==String::from("3")
        {
            driver_account_data.customer_3=String::from(helper::DUMMY_ADDRESS);
            driver_account_data.customer_3_confirm=String::from("0");
        }
    }

    //update cost and distance to driver
    driver_account_data.dist=String::from(dist_str);
    driver_account_data.cost=helper::pad_cost(total_cost_f,helper::DUMMY_COST);;
    

    //driver_account_data.customer_rides_to_finish=driver_confirm;
    //driver_account_data.ride_state=String::from("2"); //start
    msg!("driver_Account data before saving {:?}",driver_account_data);
    //save driver_account
    driver_account_data.serialize(&mut &mut driver_account.data.borrow_mut()[..])?;
    //save customer
    customer_account_data.serialize(&mut &mut customer_account.data.borrow_mut()[..]).map_err(|e2| e2.into())
    
}

pub fn step7(driver_account: &AccountInfo,
    program_id: &Pubkey, full_instruction: String) -> ProgramResult{
     
    let driver_confirm=String::from(&full_instruction[190..194]);
    
    //driver
    if driver_account.owner!=program_id{
        msg!("This account {} is not owned by program {}",driver_account.key,program_id);
    }
    //let driver_account_key:String =String::from(driver_account.key);
    msg!("driver_confirm  {}",driver_confirm);
    let mut driver_account_data =  DriverData::try_from_slice(&driver_account.data.borrow_mut()).map_err(|err|{
        msg!("Attempt to deserialize data failed {:?}",err);
        ProgramError::InvalidInstructionData
    })?;
    
    driver_account_data.customer_rides_to_finish=driver_confirm;
    driver_account_data.ride_state=String::from("2"); //start
    msg!("driver_Account data before saving {:?}",driver_account_data);
    //save driver_account
    driver_account_data.serialize(&mut &mut driver_account.data.borrow_mut()[..]).map_err(|e2| e2.into())
    
}



//step8 driver finishes customer ride
pub fn step8(driver_account: &AccountInfo,customer_account: &AccountInfo,program_id: &Pubkey, full_instruction: String) -> ProgramResult{

    let driver_finished=String::from(&full_instruction[190..194]);
    
    //customer 1
    if customer_account.owner!=program_id{
        msg!("This account {} is not owned by program {}",customer_account.key,program_id);
    }
    
    let mut customer_account_data =  CustomerData::try_from_slice(&customer_account.data.borrow_mut()).map_err(|err|{
        msg!("Attempt to deserialize data failed {:?}",err);
        ProgramError::InvalidInstructionData
    })?;


    if driver_account.owner!=program_id{
        msg!("This account {} is not owned by program {}",driver_account.key,program_id);
    }
    //let driver_account_key:String =String::from(driver_account.key);
    
    let mut driver_account_data =  DriverData::try_from_slice(&driver_account.data.borrow_mut()).map_err(|err|{
        msg!("Attempt to deserialize data failed {:?}",err);
        ProgramError::InvalidInstructionData
    })?;
    
    // if driver_finished==String::from("0000"){
    //     driver_account_data.ride_state=String::from("3"); //start
    // }
    //customer ride finished
    customer_account_data.ride_state=String::from("3"); //finished
    driver_account_data.customer_rides_to_finish =driver_finished; //update driver finished rides
    
    
    msg!("driver_Account data before saving {:?}",driver_account_data);
    //save driver_account
    driver_account_data.serialize(&mut &mut driver_account.data.borrow_mut()[..])?;
    customer_account_data.serialize(&mut &mut customer_account.data.borrow_mut()[..]).map_err(|e2| e2.into())
}

//customer pays driver
pub fn step9(customer_account: &AccountInfo,driver_account: &AccountInfo,program_id: &Pubkey, full_instruction: String) -> ProgramResult{

    //money
    //let driver_paid=String::from(&full_instruction[194..198]);
    let start_size:usize=142;
    let mut end_size:usize=186;
    
    if String::from(&full_instruction[185..186])==String::from("0"){
        end_size=185;
    }

    let customer_base58=String::from(&full_instruction[start_size..end_size]);
    
    
    //customer 1
    if customer_account.owner!=program_id{
        msg!("This account {} is not owned by program {}",customer_account.key,program_id);
    }
    
    let mut customer_account_data =  CustomerData::try_from_slice(&customer_account.data.borrow_mut()).map_err(|err|{
        msg!("Attempt to deserialize data failed {:?} customer_account_data",err);
        ProgramError::InvalidInstructionData
    })?;


    if driver_account.owner!=program_id{
        msg!("This account {} is not owned by program {}",driver_account.key,program_id);
    }
    //let driver_account_key:String =String::from(driver_account.key);
    
    let mut driver_account_data =  DriverData::try_from_slice(&driver_account.data.borrow_mut()).map_err(|err|{
        msg!("Attempt to deserialize data failed {:?} driver_account_data",err);
        ProgramError::InvalidInstructionData
    })?;
    
    //let customer_rides_paid=String::from(&driver_account_data.customer_rides_paid[194..198]);
    let mut customers_paid1=String::from(&driver_account_data.customer_rides_paid[0..1]);
    let mut customers_paid2=String::from(&driver_account_data.customer_rides_paid[1..2]);
    let mut customers_paid3=String::from(&driver_account_data.customer_rides_paid[2..3]);
    let mut customers_paid4=String::from(&driver_account_data.customer_rides_paid[3..4]);


    if driver_account_data.customer_1== customer_base58 {
        customers_paid1=String::from("1");
    }
    else if driver_account_data.customer_2== customer_base58 {
        customers_paid2=String::from("1");
    }
    else if driver_account_data.customer_3== customer_base58 {
        customers_paid3=String::from("1");
    }

    if driver_account_data.customer_rides_to_finish==String::from("0000"){
        driver_account_data.ride_state=String::from("3"); //end
    }
    
    //customer ride finished
    customer_account_data.ride_state=String::from("4"); //finished
    driver_account_data.customer_rides_paid =[customers_paid1,customers_paid2,customers_paid3,customers_paid4].join(""); //update driver finished rides
    
    
    msg!("driver_Account data before saving {:?}",driver_account);
    //save driver_account
    driver_account_data.serialize(&mut &mut driver_account.data.borrow_mut()[..])?;
    customer_account_data.serialize(&mut &mut customer_account.data.borrow_mut()[..]).map_err(|e2| e2.into())
}
//step8 customer pays, all customerp paid ride finishes
