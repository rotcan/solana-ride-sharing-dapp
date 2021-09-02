use{
    crate::{
        structs::{CustomerData,DriverData,RecordInstruction,SingleInstruction}
    }
};

pub const DUMMY_TX_ID: &str = "0000000000000000000000000000000000000000000";
pub const DUMMY_CREATED_ON: &str = "0000000000000000";
pub const DUMMY_LATLONG: &str="00000000";
pub const DUMMY_COST: &str="000000000000";
pub const DUMMY_ADDRESS: &str = "00000000000000000000000000000000000000000000";
pub const DUMMY_DISTANCE : &str="0000";
pub const KM_RATE: f32=0.01 ; //Sol
pub const DUMMY_CUSTOMER_CONFIRMED_RIDES: &str="0000";
pub const DUMMY_INSTRUCTION: &str = "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";


pub fn get_init_acccount() -> CustomerData {
    
    return CustomerData{
        profile_hash:String::from(DUMMY_TX_ID),updated_on:String::from(DUMMY_CREATED_ON),from_lat:String::from(DUMMY_LATLONG)
    ,to_lat:String::from(DUMMY_LATLONG),from_long:String::from(DUMMY_LATLONG),to_long:String::from(DUMMY_LATLONG),
    distance:String::from(DUMMY_DISTANCE),
    final_cost:String::from(DUMMY_COST),driver_address_1:String::from(DUMMY_ADDRESS),cost_1:String::from(DUMMY_COST)
    ,driver_address_2:String::from(DUMMY_ADDRESS),cost_2:String::from(DUMMY_COST)
    ,driver_address_3:String::from(DUMMY_ADDRESS),cost_3:String::from(DUMMY_COST)
    ,driver_address_4:String::from(DUMMY_ADDRESS),cost_4:String::from(DUMMY_COST)
    ,cost_1_max:String::from(DUMMY_COST),cost_2_max:String::from(DUMMY_COST),cost_3_max:String::from(DUMMY_COST),cost_4_max:String::from(DUMMY_COST)
    ,driver_select:String::from("0"),driver_confirm:String::from("0")
    ,to_pay:String::from(DUMMY_COST)
    ,ride_state:String::from("0")  // 0 not started , 1 as pending , 2 as started, 3 as end, 4 as paid 
    ,driver_pub_key:String::from(DUMMY_ADDRESS)
    };
}

pub fn get_init_driver() -> DriverData {
    return DriverData{profile_hash:String::from(DUMMY_TX_ID),
        updated_on:String::from(DUMMY_CREATED_ON),
        from_lat:String::from(DUMMY_LATLONG)
        ,to_lat:String::from(DUMMY_LATLONG),
        from_long:String::from(DUMMY_LATLONG),
        to_long:String::from(DUMMY_LATLONG),
        dist:String::from(DUMMY_DISTANCE),
        cost:String::from(DUMMY_COST),
        customer_1:String::from(DUMMY_ADDRESS),customer_1_confirm:String::from("0"),
        customer_2:String::from(DUMMY_ADDRESS),customer_2_confirm:String::from("0"),
        customer_3:String::from(DUMMY_ADDRESS),customer_3_confirm:String::from("0"),
        //customer_confirmed_rides:String::from(DUMMY_CUSTOMER_CONFIRMED_RIDES),
        customer_rides_to_finish:String::from(DUMMY_CUSTOMER_CONFIRMED_RIDES),
        customer_rides_paid:String::from(DUMMY_CUSTOMER_CONFIRMED_RIDES),
        ride_state:String::from("0")
    };
}


pub fn get_empty_instruction() -> RecordInstruction {
    return RecordInstruction{
        profile_hash:String::from(DUMMY_TX_ID),
        record_type:String::from("0"),
        user_type:String::from("0"),
        from_lat:String::from(DUMMY_LATLONG)
        ,to_lat:String::from(DUMMY_LATLONG),
        // from_long:String::from(DUMMY_LATLONG),
        // to_long:String::from(DUMMY_LATLONG),
        // distance:String::from(DUMMY_DISTANCE),
        // customer_count:String::from("0"),
        updated_on:String::from(DUMMY_CREATED_ON),
        // driver_address:String::from(DUMMY_ADDRESS),
        // customer_address:String::from(DUMMY_ADDRESS)
    };
}

pub fn get_empty_single_instruction() -> SingleInstruction {
    return SingleInstruction {
        full_instruction: String::from(DUMMY_INSTRUCTION)
    }
}


pub fn pad_cost(num: f32, pad_str: &str)-> String{
    let pad_string: String=String::from(pad_str);
    let length: usize=pad_string.len();
    let num_text: String=num.to_string();
    let mut nt2 ;
    if num_text.len()<length {
        nt2=String::from(&String::from(pad_str)[..length-num_text.len()]);
        nt2.push_str(&num_text[..]);
        println!(" {}" ,nt2);
    }else{
        nt2=String::from(&num_text[..length]);
        println!(" {}" ,nt2);
    }
    return nt2;
}